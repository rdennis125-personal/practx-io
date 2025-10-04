using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Practx.Orchestrator.Services;

namespace Practx.Orchestrator.Functions;

public class DealerPoRequestFunction
{
    private readonly IOrderWorkflowService _workflow;

    public DealerPoRequestFunction(IOrderWorkflowService workflow)
    {
        _workflow = workflow;
    }

    [Function("dealer-po-request")]
    public async Task<HttpResponseData> RunAsync(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "dealer/requests")] HttpRequestData req,
        FunctionContext executionContext)
    {
        var cancellationToken = executionContext.CancellationToken;
        var pending = await _workflow.FindDealerTimeoutsAsync(cancellationToken);
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(pending, cancellationToken: cancellationToken);
        return response;
    }
}
