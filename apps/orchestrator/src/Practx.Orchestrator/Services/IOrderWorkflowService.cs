using Practx.Orchestrator.Models;

namespace Practx.Orchestrator.Services;

public interface IOrderWorkflowService
{
    Task<OrderRecord> CreateOrderAsync(OrderCreateRequest request, string? idempotencyKey, CancellationToken cancellationToken = default);
    Task<OrderRecord?> HandleDealerResponseAsync(string token, bool approved, string actor, CancellationToken cancellationToken = default);
    Task<OrderRecord?> RecordCustomerAcknowledgementAsync(string token, string actor, CancellationToken cancellationToken = default);
    Task<OrderRecord?> HandleResolveFundingAsync(string orderId, bool approved, CancellationToken cancellationToken = default);
    Task<OrderRecord?> CreateResolveInvoiceAsync(string orderId, CancellationToken cancellationToken = default);
    Task<OrderRecord?> CreateHeldTransferAsync(string orderId, string reason, CancellationToken cancellationToken = default);
    Task<OrderRecord?> ReleaseAsync(string orderId, string reason, CancellationToken cancellationToken = default);
    Task<OrderRecord?> OpenDisputeAsync(string orderId, string reason, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<OrderRecord>> ListAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<OrderRecord>> FindDealerTimeoutsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<OrderRecord>> FindAutoReleaseCandidatesAsync(CancellationToken cancellationToken = default);
}
