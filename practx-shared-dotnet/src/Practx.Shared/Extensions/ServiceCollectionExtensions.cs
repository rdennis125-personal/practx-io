using System.Diagnostics;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Practx.Shared.Extensions;

/// <summary>
/// Extensions for registering Practx shared services.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds Practx standard logging and HTTP logging support.
    /// </summary>
    public static IServiceCollection AddPractxTelemetry(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddHttpLogging(options =>
        {
            options.LoggingFields = HttpLoggingFields.RequestMethod | HttpLoggingFields.RequestPath | HttpLoggingFields.ResponseStatusCode;
        });

        services.AddLogging(builder =>
        {
            builder.Configure(options =>
            {
                options.ActivityTrackingOptions = ActivityTrackingOptions.SpanId | ActivityTrackingOptions.TraceId | ActivityTrackingOptions.Tags;
            });
        });

        return services;
    }

    /// <summary>
    /// Adds standard Practx minimal API services (Swagger, health metadata, etc.).
    /// </summary>
    public static WebApplicationBuilder AddPractxApiDefaults(this WebApplicationBuilder builder, string serviceName)
    {
        ArgumentNullException.ThrowIfNull(builder);
        ArgumentNullException.ThrowIfNull(serviceName);

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
            {
                Title = serviceName,
                Version = "v1"
            });
        });

        builder.Services.AddProblemDetails();
        builder.Services.AddPractxTelemetry();

        return builder;
    }
}
