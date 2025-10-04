using Practx.Orchestrator.Models;

namespace Practx.Orchestrator.Services;

public interface IResolveClient
{
    Task<ResolveInvoiceResult> CreateInvoiceAsync(OrderRecord order, CancellationToken cancellationToken = default);
}
