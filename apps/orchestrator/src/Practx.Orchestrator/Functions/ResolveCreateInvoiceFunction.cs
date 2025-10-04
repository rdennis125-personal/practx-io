using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Options;
using Practx.Orchestrator.Models;
using Practx.Orchestrator.Options;
using Practx.Orchestrator.Services;

namespace Practx.Orchestrator.Functions;

public class ResolveCreateInvoiceFunction
{
    private readonly IOrderWorkflowService _workflow;
    private readonly ISignatureService _signatures;
    private readonly WorkflowOptions _options;

    public ResolveCreateInvoiceFunction(IOrderWorkflowService workflow, ISignatureService signatures, IOptions<WorkflowOptions> options)
    {
        _workflow = workflow;
        _signatures = signatures;
        _options = options.Value;
    }

    [Function("resolve-create-invoice")]
    public async Task<HttpResponseData> RunAsync(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "resolve/create-invoice")] HttpRequestData req,
        FunctionContext executionContext)
    {
        var cancellationToken = executionContext.CancellationToken;
        var body = await new StreamReader(req.Body).ReadToEndAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(_options.WebhookHmacSecret) && req.Headers.TryGetValues("X-Signature", out var signatureHeaders))
        {
            var provided = signatureHeaders.FirstOrDefault();
            if (!string.IsNullOrEmpty(body) && !_signatures.IsValid(provided, body, _options.WebhookHmacSecret))
            {
                var unauthorized = req.CreateResponse(HttpStatusCode.Unauthorized);
                await unauthorized.WriteStringAsync("Invalid signature", cancellationToken);
                return unauthorized;
            }
        }

        var orderIds = new List<string>();
        if (!string.IsNullOrWhiteSpace(body))
        {
            var payload = JsonSerializer.Deserialize<Dictionary<string, string>>(body);
            if (payload is not null && payload.TryGetValue("order_id", out var orderId) && !string.IsNullOrWhiteSpace(orderId))
            {
                orderIds.Add(orderId);
            }
        }

        if (orderIds.Count == 0)
        {
            var timeouts = await _workflow.FindDealerTimeoutsAsync(cancellationToken);
            orderIds.AddRange(timeouts.Select(order => order.OrderId));
        }

        var processed = new List<OrderRecord>();
        foreach (var orderId in orderIds.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var order = await _workflow.CreateResolveInvoiceAsync(orderId, cancellationToken);
            if (order is not null)
            {
                processed.Add(order);
            }
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(processed, cancellationToken: cancellationToken);
        return response;
    }
}
