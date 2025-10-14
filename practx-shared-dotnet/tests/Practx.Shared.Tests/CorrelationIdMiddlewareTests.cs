using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Practx.Shared;
using Practx.Shared.Middleware;
using Xunit;

namespace Practx.Shared.Tests;

public class CorrelationIdMiddlewareTests
{
    [Fact]
    public async Task AddsCorrelationIdWhenMissing()
    {
        var context = new DefaultHttpContext();
        var middleware = new CorrelationIdMiddleware(_ => Task.CompletedTask, NullLogger<CorrelationIdMiddleware>.Instance);

        await middleware.InvokeAsync(context);

        Assert.True(context.Response.Headers.ContainsKey(CorrelationConstants.CorrelationHeaderName));
        Assert.NotNull(context.Items[CorrelationConstants.CorrelationItemKey]);
    }

    [Fact]
    public async Task PreservesExistingCorrelationId()
    {
        var context = new DefaultHttpContext();
        var correlationId = Guid.NewGuid().ToString();
        context.Request.Headers[CorrelationConstants.CorrelationHeaderName] = correlationId;
        var middleware = new CorrelationIdMiddleware(_ => Task.CompletedTask, NullLogger<CorrelationIdMiddleware>.Instance);

        await middleware.InvokeAsync(context);

        Assert.Equal(correlationId, context.Response.Headers[CorrelationConstants.CorrelationHeaderName]);
        Assert.Equal(correlationId, context.Items[CorrelationConstants.CorrelationItemKey]);
    }
}
