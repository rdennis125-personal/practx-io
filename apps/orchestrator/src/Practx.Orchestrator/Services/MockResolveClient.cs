using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Practx.Orchestrator.Models;
using Practx.Orchestrator.Options;

namespace Practx.Orchestrator.Services;

public class MockResolveClient : IResolveClient
{
    private readonly ILogger<MockResolveClient> _logger;
    private readonly WorkflowOptions _options;

    public MockResolveClient(ILogger<MockResolveClient> logger, IOptions<WorkflowOptions> options)
    {
        _logger = logger;
        _options = options.Value;
    }

    public Task<ResolveInvoiceResult> CreateInvoiceAsync(OrderRecord order, CancellationToken cancellationToken = default)
    {
        var invoiceId = $"resolve-{order.OrderId}";
        _logger.LogInformation("[ResolveMock] Created invoice {InvoiceId} for order {OrderId}", invoiceId, order.OrderId);
        return Task.FromResult(new ResolveInvoiceResult(order.OrderId, invoiceId, RequiresManualReview: false));
    }
}
