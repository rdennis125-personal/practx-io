using Practx.Orchestrator.Models;

namespace Practx.Orchestrator.Services;

public interface IDealerClient
{
    Task<DealerRequestResult> NotifyAsync(OrderRecord order, string ackUrl, CancellationToken cancellationToken = default);
}
