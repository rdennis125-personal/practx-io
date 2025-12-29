using Xunit;

namespace Practx.Equipment.Api.Tests;

public class HealthEndpointTests
{
    [Fact]
    public void HealthPayload_IsHealthy()
    {
        var payload = DiagnosticsPayloads.HealthJson();

        Assert.Equal("{\"status\":\"healthy\"}", payload);
    }
}
