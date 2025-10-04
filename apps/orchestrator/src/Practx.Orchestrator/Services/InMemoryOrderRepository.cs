using System.Collections.Concurrent;
using Practx.Orchestrator.Models;

namespace Practx.Orchestrator.Services;

public class InMemoryOrderRepository : IOrderRepository
{
    private readonly ConcurrentDictionary<string, OrderRecord> _orders = new(StringComparer.OrdinalIgnoreCase);

    public Task AddAsync(OrderRecord order, CancellationToken cancellationToken = default)
    {
        _orders[order.OrderId] = order;
        return Task.CompletedTask;
    }

    public Task<OrderRecord?> GetAsync(string orderId, CancellationToken cancellationToken = default)
    {
        _orders.TryGetValue(orderId, out var order);
        return Task.FromResult(order);
    }

    public Task<IReadOnlyCollection<OrderRecord>> ListAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyCollection<OrderRecord> snapshot = _orders.Values.ToList();
        return Task.FromResult(snapshot);
    }

    public Task UpdateAsync(OrderRecord order, CancellationToken cancellationToken = default)
    {
        _orders[order.OrderId] = order;
        return Task.CompletedTask;
    }
}
