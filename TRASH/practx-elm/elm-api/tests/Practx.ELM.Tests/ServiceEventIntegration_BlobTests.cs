using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Practx.ELM.Api;

namespace Practx.ELM.Tests;

public class ServiceEventIntegration_BlobTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ServiceEventIntegration_BlobTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("Persistence:Kind", "Blob");
        });
    }

    [Fact]
    public async Task PostServiceEvent_ReturnsCreatedResult()
    {
        var client = _factory.CreateClient();

        var payload = new
        {
            deviceId = Guid.Parse("88888888-8888-8888-8888-888888888888"),
            providerId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            serviceTypeId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            occurredAt = new DateTime(2024, 7, 1, 16, 0, 0, DateTimeKind.Utc),
            spaceId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            warrantyContractId = Guid.Parse("12121212-1212-1212-1212-121212121212"),
            parts = new[]
            {
                new { partId = Guid.NewGuid(), qty = 1, lineCost = 500m }
            }
        };

        var response = await client.PostAsJsonAsync("/service-events", payload);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var content = await response.Content.ReadFromJsonAsync<ServiceEventResponse>();
        content.Should().NotBeNull();
        content!.DeviceId.Should().Be(payload.deviceId);
        content.ProviderId.Should().Be(payload.providerId);
        content.ServiceTypeId.Should().Be(payload.serviceTypeId);
        content.WarrantyContractId.Should().Be(payload.warrantyContractId);
        content.EventId.Should().NotBeEmpty();
    }

    private sealed record ServiceEventResponse(Guid EventId, Guid DeviceId, Guid ProviderId, Guid ServiceTypeId, DateTime OccurredAt, Guid? WarrantyContractId);
}
