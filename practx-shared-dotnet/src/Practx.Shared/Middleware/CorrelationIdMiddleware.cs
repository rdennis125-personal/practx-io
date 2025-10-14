using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Practx.Shared.Middleware;

/// <summary>
/// Ensures every inbound request and outbound response flows with a correlation identifier.
/// </summary>
public sealed class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CorrelationIdMiddleware> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="CorrelationIdMiddleware"/> class.
    /// </summary>
    public CorrelationIdMiddleware(RequestDelegate next, ILogger<CorrelationIdMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Invokes the middleware.
    /// </summary>
    public async Task InvokeAsync(HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var correlationId = context.Request.Headers.TryGetValue(CorrelationConstants.CorrelationHeaderName, out var values)
            && !string.IsNullOrWhiteSpace(values)
                ? values.ToString()
                : Guid.NewGuid().ToString();

        context.Items[CorrelationConstants.CorrelationItemKey] = correlationId;

        context.Response.OnStarting(() =>
        {
            if (!context.Response.Headers.ContainsKey(CorrelationConstants.CorrelationHeaderName))
            {
                context.Response.Headers.Add(CorrelationConstants.CorrelationHeaderName, correlationId);
            }

            return Task.CompletedTask;
        });

        using (_logger.BeginScope(new Dictionary<string, object>
               {
                   [CorrelationConstants.CorrelationItemKey] = correlationId,
               }))
        {
            await _next(context);
        }
    }
}
