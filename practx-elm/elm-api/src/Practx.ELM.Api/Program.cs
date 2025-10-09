using Microsoft.OpenApi.Models;
using Practx.ELM.Domain.Services;
using Practx.ELM.Persistence;
using Practx.ELM.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://0.0.0.0:5080");

builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddSingleton<WarrantyValidator>();
builder.Services.AddSingleton<CertChecker>();
builder.Services.AddSingleton<PlacementRule>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Practx ELM API",
        Version = "1.0.0"
    });
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:5173" };
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Practx ELM API v1");
    });
}

app.UseCors();

app.MapDevicesEndpoints();
app.MapWarrantiesEndpoints();
app.MapServiceEventsEndpoints();
app.MapLookupsEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapPost("/dev/seed", async (IPersistenceSeeder seeder, CancellationToken cancellationToken) =>
    {
        await seeder.SeedAsync(cancellationToken);
        return Results.Ok(new { status = "seeded" });
    })
    .WithTags("Development")
    .WithOpenApi();
}

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<IPersistenceSeeder>();
    await seeder.SeedAsync(CancellationToken.None);
}

app.Run();
