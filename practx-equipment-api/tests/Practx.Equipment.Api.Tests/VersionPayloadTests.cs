using Xunit;

namespace Practx.Equipment.Api.Tests;

public class VersionPayloadTests
{
    [Fact]
    public void VersionPayload_IncludesVersion()
    {
        var payload = DiagnosticsPayloads.VersionJson();

        Assert.Contains("\"version\"", payload);
        Assert.StartsWith("{", payload);
        Assert.EndsWith("}", payload);
    }
}
