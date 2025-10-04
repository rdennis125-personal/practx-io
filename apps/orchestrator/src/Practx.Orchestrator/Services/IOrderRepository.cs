using Practx.Orchestrator.Models;

namespace Practx.Orchestrator.Services;

public interface IOrderRepository
{
    Task AddAsync(OrderRecord order, CancellationToken cancellationToken = default);
    Task<OrderRecord?> GetAsync(string orderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<OrderRecord>> ListAsync(CancellationToken cancellationToken = default);
    Task UpdateAsync(OrderRecord order, CancellationToken cancellationToken = default);
}
