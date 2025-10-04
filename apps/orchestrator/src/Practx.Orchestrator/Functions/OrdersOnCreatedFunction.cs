using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Practx.Orchestrator.Models;
using Practx.Orchestrator.Options;
using Practx.Orchestrator.Services;

namespace Practx.Orchestrator.Functions;

public class OrdersOnCreatedFunction
{
    private readonly IOrderWorkflowService _workflow;
    private readonly ISignatureService _signatures;
    private readonly WorkflowOptions _options;
    private readonly ILogger<OrdersOnCreatedFunction> _logger;

    public OrdersOnCreatedFunction(
        IOrderWorkflowService workflow,
        ISignatureService signatures,
        IOptions<WorkflowOptions> options,
        ILogger<OrdersOnCreatedFunction> logger)
    {
        _workflow = workflow;
        _signatures = signatures;
        _options = options.Value;
        _logger = logger;
    }

    [Function("orders-on-created")]
    public async Task<HttpResponseData> RunAsync(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "orders/on-created")] HttpRequestData req,
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

        var request = JsonSerializer.Deserialize<OrderCreateRequest>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (request is null || string.IsNullOrWhiteSpace(request.OrderId))
        {
            var bad = req.CreateResponse(HttpStatusCode.BadRequest);
            await bad.WriteStringAsync("order_id is required", cancellationToken);
            return bad;
        }

        req.Headers.TryGetValues("x-idempotency-key", out var idempotencyValues);
        var idempotencyKey = idempotencyValues?.FirstOrDefault();

        try
        {
            var order = await _workflow.CreateOrderAsync(request, idempotencyKey, cancellationToken);
            var response = req.CreateResponse(HttpStatusCode.Accepted);
            await response.WriteAsJsonAsync(order, cancellationToken: cancellationToken);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process order created webhook for {OrderId}", request.OrderId);
            var error = req.CreateResponse(HttpStatusCode.Conflict);
            await error.WriteStringAsync(ex.Message, cancellationToken);
            return error;
        }
    }
}
