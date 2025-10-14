using Practx.Shared.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.AddPractxApiDefaults("Practx Equipment API");

var app = builder.Build();

app.UseHttpLogging();
app.UsePractxCorrelationId();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/healthz", () => Results.Ok(new { status = "healthy" }))
   .WithName("HealthCheck")
   .WithTags("Diagnostics")
   .WithOpenApi();

app.MapGet("/version", () =>
{
    var version = typeof(Program).Assembly.GetName().Version?.ToString() ?? "0.0.0";
    return Results.Ok(new { version });
}).WithName("Version")
  .WithTags("Diagnostics")
  .WithOpenApi();

app.Run();

public partial class Program;
