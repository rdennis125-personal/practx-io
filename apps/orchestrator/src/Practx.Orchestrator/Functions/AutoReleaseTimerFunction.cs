using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Practx.Orchestrator.Services;

namespace Practx.Orchestrator.Functions;

public class AutoReleaseTimerFunction
{
    private readonly IOrderWorkflowService _workflow;
    private readonly ILogger<AutoReleaseTimerFunction> _logger;

    public AutoReleaseTimerFunction(IOrderWorkflowService workflow, ILogger<AutoReleaseTimerFunction> logger)
    {
        _workflow = workflow;
        _logger = logger;
    }

    [Function("auto-release-timer")]
    public async Task RunAsync([TimerTrigger("0 */15 * * * *")] TimerInfo timer, FunctionContext context)
    {
        var cancellationToken = context.CancellationToken;
        var candidates = await _workflow.FindAutoReleaseCandidatesAsync(cancellationToken);
        foreach (var order in candidates)
        {
            _logger.LogInformation("Auto releasing order {OrderId}", order.OrderId);
            await _workflow.ReleaseAsync(order.OrderId, "Auto release timer", cancellationToken);
        }
    }
}
