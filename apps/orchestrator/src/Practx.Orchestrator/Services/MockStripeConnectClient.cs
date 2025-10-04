using Microsoft.Extensions.Logging;
using Practx.Orchestrator.Models;

namespace Practx.Orchestrator.Services;

public class MockStripeConnectClient : IStripeConnectClient
{
    private readonly ILogger<MockStripeConnectClient> _logger;

    public MockStripeConnectClient(ILogger<MockStripeConnectClient> logger)
    {
        _logger = logger;
    }

    public Task<TransferIntentResult> CreateHeldTransferAsync(OrderRecord order, CancellationToken cancellationToken = default)
    {
        var transferId = $"tr_{order.OrderId}";
        _logger.LogInformation("[StripeMock] Created held transfer {TransferId} for order {OrderId}", transferId, order.OrderId);
        return Task.FromResult(new TransferIntentResult(order.OrderId, transferId, "held"));
    }

    public Task ReleaseTransferAsync(OrderRecord order, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[StripeMock] Released transfer for order {OrderId}", order.OrderId);
        return Task.CompletedTask;
    }
}
