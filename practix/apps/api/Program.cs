using System.Security.Claims;
using Dapper;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("SQLCONN") ?? builder.Configuration["SQLCONN"];
if (string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = "Server=localhost;Database=practix;Integrated Security=true;Encrypt=false";
}

builder.Services.AddSingleton(new SqlConnectionFactory(connectionString));
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();
app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/auth/me", async (SqlConnectionFactory factory, ClaimsPrincipal user, HttpContext context) =>
{
    if (!TryResolveOrgId(user, context, out var orgId))
    {
        return Results.Unauthorized();
    }

    var userEmail = user.FindFirst(ClaimTypes.Email)?.Value ?? user.FindFirst("emails")?.Value;

    await using var conn = await factory.OpenAsync();
    var profile = await conn.QuerySingleOrDefaultAsync(@"select o.ORG_ID as orgId,
                                                                o.NAME as orgName,
                                                                o.PLAN as plan,
                                                                o.STATUS as orgStatus,
                                                                s.STATUS as subscriptionStatus,
                                                                s.PRICE_ID as priceId
                                                         from ORG o
                                                         left join SUBSCRIPTION s on s.ORG_ID = o.ORG_ID
                                                         where o.ORG_ID = @orgId",
        new { orgId });

    var self = await conn.QuerySingleOrDefaultAsync(@"select USER_ID as userId,
                                                            EMAIL as email,
                                                            DISPLAY_NAME as displayName,
                                                            STATUS as status
                                                     from [USER]
                                                     where ORG_ID = @orgId and EMAIL = @email",
        new { orgId, email = userEmail });

    return Results.Ok(new
    {
        profile,
        user = self,
        claims = user.Claims.Select(c => new { c.Type, c.Value })
    });
});

app.MapGet("/entitlements", async (SqlConnectionFactory factory, ClaimsPrincipal user, HttpContext context) =>
{
    if (!TryResolveOrgId(user, context, out var orgId))
    {
        return Results.Unauthorized();
    }

    await using var conn = await factory.OpenAsync();
    var entitlement = await conn.QuerySingleOrDefaultAsync(@"select ELM as elm from ENTITLEMENT where ORG_ID = @orgId",
        new { orgId });

    entitlement ??= new { elm = false };

    return Results.Ok(entitlement);
});

app.MapGet("/elm/devices", async (SqlConnectionFactory factory, ClaimsPrincipal user, HttpContext context) =>
{
    if (!TryResolveOrgId(user, context, out var orgId))
    {
        return Results.Unauthorized();
    }

    await using var conn = await factory.OpenAsync();
    var devices = await conn.QueryAsync<DeviceRow>("select DEVICE_ID as deviceId, OEM as oem, MODEL as model, SERIAL as serial, STATUS as status from DEVICE where ORG_ID = @orgId",
        new { orgId });
    return Results.Ok(devices);
});

app.MapPost("/elm/devices", async (SqlConnectionFactory factory, ClaimsPrincipal user, HttpContext context, DeviceDto dto) =>
{
    if (!TryResolveOrgId(user, context, out var orgId))
    {
        return Results.Unauthorized();
    }

    var deviceId = Guid.NewGuid();
    await using var conn = await factory.OpenAsync();
    await conn.ExecuteAsync(@"insert into DEVICE(DEVICE_ID, ORG_ID, OEM, MODEL, SERIAL, INSTALL_DATE, LOCATION)
                              values(@deviceId, @orgId, @Oem, @Model, @Serial, @InstallDate, @Location)",
        new { deviceId, orgId, dto.Oem, dto.Model, dto.Serial, dto.InstallDate, dto.Location });

    return Results.Created($"/elm/devices/{deviceId}", new { deviceId });
});

app.MapGet("/elm/devices/{deviceId:guid}", async (SqlConnectionFactory factory, ClaimsPrincipal user, HttpContext context, Guid deviceId) =>
{
    if (!TryResolveOrgId(user, context, out var orgId))
    {
        return Results.Unauthorized();
    }

    await using var conn = await factory.OpenAsync();
    var device = await conn.QuerySingleOrDefaultAsync<DeviceRow>(@"select DEVICE_ID as deviceId, OEM as oem, MODEL as model, SERIAL as serial, STATUS as status, INSTALL_DATE as installDate, LOCATION as location
                                                                  from DEVICE where ORG_ID = @orgId and DEVICE_ID = @deviceId",
        new { orgId, deviceId });

    return device is null ? Results.NotFound() : Results.Ok(device);
});

app.MapPatch("/elm/devices/{deviceId:guid}", async (SqlConnectionFactory factory, ClaimsPrincipal user, HttpContext context, Guid deviceId, DeviceUpdateDto dto) =>
{
    if (!TryResolveOrgId(user, context, out var orgId))
    {
        return Results.Unauthorized();
    }

    await using var conn = await factory.OpenAsync();
    var affected = await conn.ExecuteAsync(@"update DEVICE set LOCATION = coalesce(@Location, LOCATION), STATUS = coalesce(@Status, STATUS)
                                            where DEVICE_ID = @deviceId and ORG_ID = @orgId",
        new { orgId, deviceId, dto.Location, dto.Status });

    return affected == 0 ? Results.NotFound() : Results.NoContent();
});

app.MapPost("/elm/orders", async (SqlConnectionFactory factory, ClaimsPrincipal user, HttpContext context, OrderDto dto) =>
{
    if (!TryResolveOrgId(user, context, out var orgId))
    {
        return Results.Unauthorized();
    }

    var orderId = Guid.NewGuid();
    await using var conn = await factory.OpenAsync();
    await conn.ExecuteAsync(@"insert into [ORDER](ORDER_ID, ORG_ID, TYPE, DEALER_ID, OEM, TOTAL_MSRP, STATUS)
                              values(@orderId, @orgId, @Type, @DealerId, @Oem, @TotalMsrp, 'received')",
        new { orderId, orgId, dto.Type, dto.DealerId, dto.Oem, dto.TotalMsrp });

    return Results.Created($"/elm/orders/{orderId}", new { orderId });
});

app.MapGet("/elm/dealers", async (SqlConnectionFactory factory, string? region) =>
{
    await using var conn = await factory.OpenAsync();
    var dealers = await conn.QueryAsync(@"select DEALER_ID as dealerId, NAME as name, REGION as region from DEALER where @region is null or REGION = @region",
        new { region });
    return Results.Ok(dealers);
});

app.MapPost("/billing/checkout", () =>
{
    // Placeholder endpoint to initiate Stripe Checkout session. In production this will create a real session.
    return Results.Ok(new { checkoutUrl = "https://checkout.stripe.com/pay/cs_test_placeholder" });
});

app.Run();

static bool TryResolveOrgId(ClaimsPrincipal user, HttpContext context, out Guid orgId)
{
    var orgClaim = user.FindFirst("practix/org_id")?.Value;
    if (Guid.TryParse(orgClaim, out orgId))
    {
        return true;
    }

    if (Guid.TryParse(context.Request.Headers["x-practix-org"], out orgId))
    {
        return true;
    }

    orgId = Guid.Empty;
    return false;
}

public record DeviceDto(string Oem, string Model, string Serial, DateTime? InstallDate, string? Location);
public record DeviceUpdateDto(string? Location, string? Status);
public record OrderDto(string Type, Guid? DealerId, string? Oem, decimal TotalMsrp);

public record DeviceRow(Guid DeviceId, string Oem, string Model, string Serial, string Status, DateTime? InstallDate = null, string? Location = null);

public class SqlConnectionFactory
{
    private readonly string _connectionString;

    public SqlConnectionFactory(string connectionString) => _connectionString = connectionString;

    public async Task<SqlConnection> OpenAsync()
    {
        var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        return conn;
    }
}
