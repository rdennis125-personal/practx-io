using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Options;
using Practx.Orchestrator.Models;
using Practx.Orchestrator.Options;
using Practx.Orchestrator.Services;

namespace Practx.Orchestrator.Functions;

public class ResolveFundedHandlerFunction
{
    private readonly IOrderWorkflowService _workflow;
    private readonly ISignatureService _signatures;
    private readonly WorkflowOptions _options;

    public ResolveFundedHandlerFunction(IOrderWorkflowService workflow, ISignatureService signatures, IOptions<WorkflowOptions> options)
    {
        _workflow = workflow;
        _signatures = signatures;
        _options = options.Value;
    }

    [Function("resolve-funded-handler")]
    public async Task<HttpResponseData> RunAsync(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "resolve/funded")] HttpRequestData req,
        FunctionContext executionContext)
    {
        var cancellationToken = executionContext.CancellationToken;
        var body = await new StreamReader(req.Body).ReadToEndAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(_options.WebhookHmacSecret))
        {
            req.Headers.TryGetValues("X-Signature", out var signatureHeaders);
            var provided = signatureHeaders?.FirstOrDefault();
            if (!_signatures.IsValid(provided, body, _options.WebhookHmacSecret))
            {
                var unauthorized = req.CreateResponse(HttpStatusCode.Unauthorized);
                await unauthorized.WriteStringAsync("Invalid signature", cancellationToken);
                return unauthorized;
            }
        }

        var payload = JsonSerializer.Deserialize<ResolveFundingNotification>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (payload is null || string.IsNullOrWhiteSpace(payload.OrderId))
        {
            var bad = req.CreateResponse(HttpStatusCode.BadRequest);
            await bad.WriteStringAsync("order_id is required", cancellationToken);
            return bad;
        }

        var order = await _workflow.HandleResolveFundingAsync(payload.OrderId, payload.Approved, cancellationToken);
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
