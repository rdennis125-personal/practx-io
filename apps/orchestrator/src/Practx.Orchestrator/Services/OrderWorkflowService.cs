using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Practx.Orchestrator.Models;
using Practx.Orchestrator.Options;

namespace Practx.Orchestrator.Services;

public class OrderWorkflowService : IOrderWorkflowService
{
    private readonly IOrderRepository _orders;
    private readonly IAckTokenService _ackTokens;
    private readonly IDealerClient _dealerClient;
    private readonly IResolveClient _resolveClient;
    private readonly IStripeConnectClient _stripeClient;
    private readonly IDateTimeProvider _clock;
    private readonly WorkflowOptions _options;
    private readonly ILogger<OrderWorkflowService> _logger;

    public OrderWorkflowService(
        IOrderRepository orders,
        IAckTokenService ackTokens,
        IDealerClient dealerClient,
        IResolveClient resolveClient,
        IStripeConnectClient stripeClient,
        IDateTimeProvider clock,
        IOptions<WorkflowOptions> options,
        ILogger<OrderWorkflowService> logger)
    {
        _orders = orders;
        _ackTokens = ackTokens;
        _dealerClient = dealerClient;
        _resolveClient = resolveClient;
        _stripeClient = stripeClient;
        _clock = clock;
        _logger = logger;
        _options = options.Value;
    }

    public async Task<OrderRecord> CreateOrderAsync(OrderCreateRequest request, string? idempotencyKey, CancellationToken cancellationToken = default)
    {
        var existing = await _orders.GetAsync(request.OrderId, cancellationToken);
        if (existing != null)
        {
            if (!string.IsNullOrWhiteSpace(idempotencyKey) && string.Equals(existing.IdempotencyKey, idempotencyKey, StringComparison.Ordinal))
            {
                _logger.LogInformation("Order {OrderId} returned from idempotent create", existing.OrderId);
                return existing;
            }

            throw new InvalidOperationException($"Order {request.OrderId} already exists");
        }

        var now = _clock.UtcNow;
        var order = new OrderRecord
        {
            OrderId = request.OrderId,
            CustomerId = request.CustomerId,
            AmountCents = request.AmountCents,
            Currency = request.Currency,
            PaymentMethod = request.PaymentMethod,
            DealerName = request.DealerName,
            ApContactEmail = request.ApContactEmail,
            CreatedAt = now,
            Notes = request.Notes
        };
        order.IdempotencyKey = idempotencyKey;

        await _orders.AddAsync(order, cancellationToken);

        if (order.PaymentMethod == PaymentMethod.DealerAccount)
        {
            order.Status = OrderStatus.DealerRequested;
            order.DealerRequestAt = now;
            var token = _ackTokens.CreateToken(order.OrderId);
            order.AcknowledgementToken = token;
            await _orders.UpdateAsync(order, cancellationToken);

            var ackUrl = BuildAckUrl(token);
            await _dealerClient.NotifyAsync(order, ackUrl, cancellationToken);
        }
        else
        {
            order.Status = OrderStatus.AwaitingAcknowledgement;
            await _orders.UpdateAsync(order, cancellationToken);
            await CreateHeldTransferAsync(order.OrderId, "Non-dealer held transfer", cancellationToken);
        }

        return order;
    }

    public async Task<OrderRecord?> HandleDealerResponseAsync(string token, bool approved, string actor, CancellationToken cancellationToken = default)
    {
        if (!_ackTokens.TryValidate(token, out var orderId) || string.IsNullOrWhiteSpace(orderId))
        {
            return null;
        }

        var order = await _orders.GetAsync(orderId, cancellationToken);
        if (order is null)
        {
            return null;
        }

        var now = _clock.UtcNow;
        if (approved)
        {
            order.Status = OrderStatus.DealerAcknowledged;
            order.DealerAcknowledgedAt = now;
            order.Notes = $"Dealer approved by {actor} on {now:u}";
            await _orders.UpdateAsync(order, cancellationToken);
            await CreateHeldTransferAsync(order.OrderId, "Dealer approved", cancellationToken);
        }
        else
        {
            order.Status = OrderStatus.DealerDeclined;
            order.Notes = $"Dealer declined by {actor} on {now:u}";
            await _orders.UpdateAsync(order, cancellationToken);
        }

        return order;
    }

    public async Task<OrderRecord?> RecordCustomerAcknowledgementAsync(string token, string actor, CancellationToken cancellationToken = default)
    {
        if (!_ackTokens.TryValidate(token, out var orderId) || string.IsNullOrWhiteSpace(orderId))
        {
            return null;
        }

        var order = await _orders.GetAsync(orderId, cancellationToken);
        if (order is null)
        {
            return null;
        }

        order.Notes = $"Customer acknowledged by {actor} on {_clock.UtcNow:u}";
        await _orders.UpdateAsync(order, cancellationToken);
        await ReleaseAsync(order.OrderId, "Customer acknowledgement", cancellationToken);
        return order;
    }

    public async Task<OrderRecord?> HandleResolveFundingAsync(string orderId, bool approved, CancellationToken cancellationToken = default)
    {
        var order = await _orders.GetAsync(orderId, cancellationToken);
        if (order is null)
        {
            return null;
        }

        var now = _clock.UtcNow;
        if (approved)
        {
            order.Status = OrderStatus.ResolveFunded;
            order.ResolveFundedAt = now;
            await _orders.UpdateAsync(order, cancellationToken);
            await CreateHeldTransferAsync(order.OrderId, "Resolve funded", cancellationToken);
        }
        else
        {
            order.Status = OrderStatus.Disputed;
            order.Notes = $"Resolve declined funding on {now:u}";
            await _orders.UpdateAsync(order, cancellationToken);
        }

        return order;
    }

    public async Task<OrderRecord?> CreateResolveInvoiceAsync(string orderId, CancellationToken cancellationToken = default)
    {
        var order = await _orders.GetAsync(orderId, cancellationToken);
        if (order is null)
        {
            return null;
        }

        var result = await _resolveClient.CreateInvoiceAsync(order, cancellationToken);
        order.Status = OrderStatus.ResolveInvoiceCreated;
        order.ResolveInvoiceAt = _clock.UtcNow;
        order.Notes = $"Resolve invoice {result.InvoiceId} created";
        await _orders.UpdateAsync(order, cancellationToken);
        return order;
    }

    public async Task<OrderRecord?> CreateHeldTransferAsync(string orderId, string reason, CancellationToken cancellationToken = default)
    {
        var order = await _orders.GetAsync(orderId, cancellationToken);
        if (order is null)
        {
            return null;
        }

        if (order.Status == OrderStatus.Released)
        {
            return order;
        }

        if (order.HeldTransferCreatedAt.HasValue)
        {
            return order;
        }

        var transfer = await _stripeClient.CreateHeldTransferAsync(order, cancellationToken);
        order.Status = OrderStatus.HeldTransferCreated;
        order.HeldTransferCreatedAt = _clock.UtcNow;
        order.Notes = $"{reason} - transfer {transfer.TransferId}";
        await _orders.UpdateAsync(order, cancellationToken);
        return order;
    }

    public async Task<OrderRecord?> ReleaseAsync(string orderId, string reason, CancellationToken cancellationToken = default)
    {
        var order = await _orders.GetAsync(orderId, cancellationToken);
        if (order is null)
        {
            return null;
        }

        await _stripeClient.ReleaseTransferAsync(order, cancellationToken);
        order.Status = OrderStatus.Released;
        order.ReleasedAt = _clock.UtcNow;
        order.Notes = reason;
        await _orders.UpdateAsync(order, cancellationToken);
        return order;
    }

    public async Task<OrderRecord?> OpenDisputeAsync(string orderId, string reason, CancellationToken cancellationToken = default)
    {
        var order = await _orders.GetAsync(orderId, cancellationToken);
        if (order is null)
        {
            return null;
        }

        order.Status = OrderStatus.Disputed;
        order.Notes = reason;
        await _orders.UpdateAsync(order, cancellationToken);
        return order;
    }

    public Task<IReadOnlyCollection<OrderRecord>> ListAsync(CancellationToken cancellationToken = default) => _orders.ListAsync(cancellationToken);

    public async Task<IEnumerable<OrderRecord>> FindDealerTimeoutsAsync(CancellationToken cancellationToken = default)
    {
        var now = _clock.UtcNow;
        var all = await _orders.ListAsync(cancellationToken);
        return all.Where(order => order.Status == OrderStatus.DealerRequested && order.DealerRequestAt.HasValue && now - order.DealerRequestAt.Value > TimeSpan.FromMinutes(_options.DealerTimeoutMinutes));
    }

    public async Task<IEnumerable<OrderRecord>> FindAutoReleaseCandidatesAsync(CancellationToken cancellationToken = default)
    {
        var now = _clock.UtcNow;
        var threshold = TimeSpan.FromDays(_options.AutoReleaseDays);
        var all = await _orders.ListAsync(cancellationToken);
        return all.Where(order =>
            (order.Status == OrderStatus.HeldTransferCreated || order.Status == OrderStatus.ResolveFunded || order.Status == OrderStatus.AwaitingAcknowledgement)
            && order.HeldTransferCreatedAt.HasValue
            && now - order.HeldTransferCreatedAt.Value > threshold);
    }

    private string BuildAckUrl(string token)
    {
        var baseUrl = _options.AckUrlBase?.TrimEnd('/') ?? string.Empty;
        return string.IsNullOrWhiteSpace(baseUrl) ? token : $"{baseUrl}?token={Uri.EscapeDataString(token)}";
    }
}
