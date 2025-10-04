using Practx.Orchestrator.Models;

namespace Practx.Orchestrator.Services;

public interface IStripeConnectClient
{
    Task<TransferIntentResult> CreateHeldTransferAsync(OrderRecord order, CancellationToken cancellationToken = default);
    Task ReleaseTransferAsync(OrderRecord order, CancellationToken cancellationToken = default);
}
