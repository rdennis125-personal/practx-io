using Microsoft.AspNetCore.Builder;
using Practx.Shared.Middleware;

namespace Practx.Shared.Extensions;

/// <summary>
/// Extension methods for configuring the Practx middleware pipeline.
/// </summary>
public static class ApplicationBuilderExtensions
{
    /// <summary>
    /// Adds the Practx correlation identifier middleware.
    /// </summary>
    public static IApplicationBuilder UsePractxCorrelationId(this IApplicationBuilder app)
    {
        ArgumentNullException.ThrowIfNull(app);
        return app.UseMiddleware<CorrelationIdMiddleware>();
    }
}
