using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Practx.Orchestrator.Models;
using Practx.Orchestrator.Options;

namespace Practx.Orchestrator.Services;

public class MockDealerClient : IDealerClient
{
    private readonly ILogger<MockDealerClient> _logger;
    private readonly WorkflowOptions _options;

    public MockDealerClient(ILogger<MockDealerClient> logger, IOptions<WorkflowOptions> options)
    {
        _logger = logger;
        _options = options.Value;
    }

    public Task<DealerRequestResult> NotifyAsync(OrderRecord order, string ackUrl, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[DealerMock] Requested PO verification for order {OrderId} ({Amount:C}) dealer {Dealer}", order.OrderId, order.AmountCents / 100m, order.DealerName);
        _logger.LogInformation("[DealerMock] Simulated response delay {DelaySeconds}s", _options.MockDealerDelaySeconds);
        _logger.LogInformation("[DealerMock] Approve via {AckUrl}?approve=true or decline with ?approve=false", ackUrl);
        return Task.FromResult(new DealerRequestResult(order.OrderId, ackUrl, "Dealer verification queued"));
    }
}
