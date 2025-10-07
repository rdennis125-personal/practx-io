using Dapper;
using Microsoft.Extensions.Logging;
using Stripe;

namespace StripeWebhook;

public class EntitlementService
{
    private readonly SqlConnectionFactory _factory;
    private readonly ILogger<EntitlementService> _logger;

    public EntitlementService(SqlConnectionFactory factory, ILogger<EntitlementService> logger)
    {
        _factory = factory;
        _logger = logger;
    }

    public async Task<Guid?> HandleCheckoutCompletedAsync(Event stripeEvent)
    {
        var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
        var email = session?.CustomerDetails?.Email ?? session?.CustomerEmail;
        if (string.IsNullOrWhiteSpace(email))
        {
            _logger.LogWarning("Checkout session {EventId} missing customer email", stripeEvent.Id);
            return null;
        }

        var orgId = await EnsureOrgAsync(email);
        await UpsertSubscriptionAsync(orgId, new SubscriptionUpdate
        {
            Status = "active",
            PriceId = session?.Mode == "subscription" ? session?.Metadata?.GetValueOrDefault("priceId") ?? session?.Subscription : session?.Subscription,
            StripeCustomerId = session?.CustomerId,
            StripeSubscriptionId = session?.Subscription,
            Product = "elm",
            RenewsAt = session?.ExpiresAt
        });
        await SetEntitlementAsync(orgId, true);
        return orgId;
    }

    public async Task<Guid?> HandleSubscriptionDeletedAsync(Event stripeEvent)
    {
        var subscription = stripeEvent.Data.Object as Stripe.Subscription;
        var customerId = subscription?.CustomerId;
        if (string.IsNullOrWhiteSpace(customerId))
        {
            _logger.LogWarning("Subscription deleted event {EventId} missing customer id", stripeEvent.Id);
            return null;
        }

        await using var conn = await _factory.OpenAsync();
        var orgId = await conn.ExecuteScalarAsync<Guid?>("select ORG_ID from SUBSCRIPTION where STRIPE_CUSTOMER_ID = @customerId", new { customerId });
        if (orgId is null)
        {
            _logger.LogWarning("No org found for subscription deleted event {EventId}", stripeEvent.Id);
            return null;
        }

        await UpsertSubscriptionAsync(orgId.Value, new SubscriptionUpdate
        {
            Status = "canceled",
            StripeCustomerId = customerId,
            StripeSubscriptionId = subscription?.Id,
            PriceId = subscription?.Items?.Data?.FirstOrDefault()?.Price?.Id,
            Product = subscription?.Items?.Data?.FirstOrDefault()?.Price?.ProductId,
            RenewsAt = subscription?.CurrentPeriodEnd
        });
        await SetEntitlementAsync(orgId.Value, false);
        return orgId;
    }

    private async Task<Guid> EnsureOrgAsync(string email)
    {
        var domain = email.Split('@').Last();
        await using var conn = await _factory.OpenAsync();
        var existing = await conn.QuerySingleOrDefaultAsync<Guid?>(
            "select ORG_ID from ORG where lower(NAME) = lower(@name)", new { name = domain });
        if (existing is Guid orgId)
        {
            await EnsureUserAsync(conn, orgId, email);
            return orgId;
        }

        var newOrgId = Guid.NewGuid();
        await conn.ExecuteAsync("insert into ORG(ORG_ID, NAME, PLAN, STATUS) values(@orgId, @name, 'paid', 'active')",
            new { orgId = newOrgId, name = domain });
        await conn.ExecuteAsync("insert into ENTITLEMENT(ORG_ID, ELM) values(@orgId, 0)", new { orgId = newOrgId });
        await conn.ExecuteAsync("insert into SUBSCRIPTION(ORG_ID, STATUS) values(@orgId, 'none')", new { orgId = newOrgId });
        await EnsureUserAsync(conn, newOrgId, email);
        return newOrgId;
    }

    private static async Task EnsureUserAsync(System.Data.IDbConnection conn, Guid orgId, string email)
    {
        await conn.ExecuteAsync(@"if not exists(select 1 from [USER] where ORG_ID = @orgId and EMAIL = @email)
                                    insert into [USER](ORG_ID, EMAIL, STATUS) values(@orgId, @email, 'active')",
            new { orgId, email });
    }

    private async Task UpsertSubscriptionAsync(Guid orgId, SubscriptionUpdate update)
    {
        await using var conn = await _factory.OpenAsync();
        await conn.ExecuteAsync(@"if exists(select 1 from SUBSCRIPTION where ORG_ID = @orgId)
                                    update SUBSCRIPTION
                                       set STRIPE_CUSTOMER_ID = coalesce(@StripeCustomerId, STRIPE_CUSTOMER_ID),
                                           STRIPE_SUBSCRIPTION_ID = coalesce(@StripeSubscriptionId, STRIPE_SUBSCRIPTION_ID),
                                           PRODUCT = coalesce(@Product, PRODUCT),
                                           PRICE_ID = coalesce(@PriceId, PRICE_ID),
                                           STATUS = coalesce(@Status, STATUS),
                                           RENEWS_AT = @RenewsAt,
                                           UPDATED_AT = sysutcdatetime()
                                    where ORG_ID = @orgId
                                  else
                                    insert into SUBSCRIPTION(ORG_ID, STRIPE_CUSTOMER_ID, STRIPE_SUBSCRIPTION_ID, PRODUCT, PRICE_ID, STATUS, RENEWS_AT)
                                    values(@orgId, @StripeCustomerId, @StripeSubscriptionId, @Product, @PriceId, @Status, @RenewsAt)",
            new
            {
                orgId,
                update.StripeCustomerId,
                update.StripeSubscriptionId,
                update.Product,
                update.PriceId,
                update.Status,
                update.RenewsAt
            });
    }

    private async Task SetEntitlementAsync(Guid orgId, bool elm)
    {
        await using var conn = await _factory.OpenAsync();
        await conn.ExecuteAsync(@"if exists(select 1 from ENTITLEMENT where ORG_ID = @orgId)
                                    update ENTITLEMENT set ELM = @elm, UPDATED_AT = sysutcdatetime() where ORG_ID = @orgId
                                  else
                                    insert into ENTITLEMENT(ORG_ID, ELM) values(@orgId, @elm)",
            new { orgId, elm });
    }

    private class SubscriptionUpdate
    {
        public string? StripeCustomerId { get; set; }
        public string? StripeSubscriptionId { get; set; }
        public string? Product { get; set; }
        public string? PriceId { get; set; }
        public string? Status { get; set; }
        public DateTime? RenewsAt { get; set; }
    }
}
