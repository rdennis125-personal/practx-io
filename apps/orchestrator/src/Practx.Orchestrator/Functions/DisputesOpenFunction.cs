using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Practx.Orchestrator.Models;
using Practx.Orchestrator.Services;

namespace Practx.Orchestrator.Functions;

public class DisputesOpenFunction
{
    private readonly IOrderWorkflowService _workflow;

    public DisputesOpenFunction(IOrderWorkflowService workflow)
    {
        _workflow = workflow;
    }

    [Function("disputes-open")]
    public async Task<HttpResponseData> RunAsync(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "disputes/open")] HttpRequestData req,
        FunctionContext executionContext)
    {
        var cancellationToken = executionContext.CancellationToken;
        var body = await new StreamReader(req.Body).ReadToEndAsync(cancellationToken);
        var payload = JsonSerializer.Deserialize<DisputeRequest>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (payload is null || string.IsNullOrWhiteSpace(payload.OrderId))
        {
            var bad = req.CreateResponse(HttpStatusCode.BadRequest);
            await bad.WriteStringAsync("order_id is required", cancellationToken);
            return bad;
        }

        var order = await _workflow.OpenDisputeAsync(payload.OrderId, payload.Reason ?? "dispute", cancellationToken);
        if (order is null)
        {
            var notFound = req.CreateResponse(HttpStatusCode.NotFound);
            await notFound.WriteStringAsync("Order not found", cancellationToken);
            return notFound;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(order, cancellationToken: cancellationToken);
        return response;
    }
}
