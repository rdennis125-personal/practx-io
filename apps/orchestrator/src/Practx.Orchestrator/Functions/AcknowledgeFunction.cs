using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Options;
using Practx.Orchestrator.Models;
using Practx.Orchestrator.Options;
using Practx.Orchestrator.Services;

namespace Practx.Orchestrator.Functions;

public class AcknowledgeFunction
{
    private readonly IOrderWorkflowService _workflow;
    private readonly ISignatureService _signatures;
    private readonly WorkflowOptions _options;

    public AcknowledgeFunction(IOrderWorkflowService workflow, ISignatureService signatures, IOptions<WorkflowOptions> options)
    {
        _workflow = workflow;
        _signatures = signatures;
        _options = options.Value;
    }

    [Function("acknowledge")]
    public async Task<HttpResponseData> RunAsync(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "ack")] HttpRequestData req,
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

        var payload = JsonSerializer.Deserialize<DealerAckRequest>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (payload is null || string.IsNullOrWhiteSpace(payload.Token))
        {
            var bad = req.CreateResponse(HttpStatusCode.BadRequest);
            await bad.WriteStringAsync("token is required", cancellationToken);
            return bad;
        }

        var order = await _workflow.RecordCustomerAcknowledgementAsync(payload.Token, payload.Actor, cancellationToken);
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
