using System.Net;
using System.Text;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;

namespace StripeWebhook.Functions;

public class StripeWebhookFunction
{
    private readonly ILogger<StripeWebhookFunction> _logger;
    private readonly EventRepository _events;
    private readonly EntitlementService _entitlements;
    private readonly StripeOptions _options;

    public StripeWebhookFunction(ILogger<StripeWebhookFunction> logger, EventRepository events, EntitlementService entitlements, IOptions<StripeOptions> options)
    {
        _logger = logger;
        _events = events;
        _entitlements = entitlements;
        _options = options.Value;
    }

    [Function("StripeWebhook")]
    public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "post", Route = "stripe/webhook")] HttpRequestData req)
    {
        var json = await new StreamReader(req.Body).ReadToEndAsync();
        var response = req.CreateResponse();

        if (string.IsNullOrWhiteSpace(_options.WebhookSecret))
        {
            _logger.LogError("Stripe webhook secret not configured");
            response.StatusCode = HttpStatusCode.InternalServerError;
            await response.WriteStringAsync("Webhook not configured");
            return response;
        }

        if (!req.Headers.TryGetValues("Stripe-Signature", out var signatureHeaders))
        {
            _logger.LogWarning("Missing Stripe signature header");
            response.StatusCode = HttpStatusCode.BadRequest;
            await response.WriteStringAsync("Missing signature");
            return response;
        }

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(json, signatureHeaders.First(), _options.WebhookSecret);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate Stripe webhook signature");
            response.StatusCode = HttpStatusCode.BadRequest;
            await response.WriteStringAsync("Invalid signature");
            return response;
        }

        Guid? orgId = null;
        switch (stripeEvent.Type)
        {
            case Events.CheckoutSessionCompleted:
                orgId = await _entitlements.HandleCheckoutCompletedAsync(stripeEvent);
                break;
            case Events.CustomerSubscriptionDeleted:
                orgId = await _entitlements.HandleSubscriptionDeletedAsync(stripeEvent);
                break;
            default:
                _logger.LogInformation("Unhandled Stripe event {EventType}", stripeEvent.Type);
                break;
        }

        await _events.StoreAsync(stripeEvent.Id, stripeEvent.Type, orgId, json);

        response.StatusCode = HttpStatusCode.OK;
        await response.WriteStringAsync("ok");
        return response;
    }
}
