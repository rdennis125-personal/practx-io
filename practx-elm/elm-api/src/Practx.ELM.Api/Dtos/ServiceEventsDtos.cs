using System.Text.Json.Serialization;
using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Api.Dtos;

public record ServiceEventPartCreateDto(
    [property: JsonPropertyName("partId")] Guid PartId,
    [property: JsonPropertyName("qty")] int Qty,
    [property: JsonPropertyName("lineCost")] decimal? LineCost);

public record ServiceEventCreateDto(
    [property: JsonPropertyName("deviceId")] Guid DeviceId,
    [property: JsonPropertyName("providerId")] Guid ProviderId,
    [property: JsonPropertyName("serviceTypeId")] Guid ServiceTypeId,
    [property: JsonPropertyName("occurredAt")] DateTime OccurredAt,
    [property: JsonPropertyName("spaceId")] Guid? SpaceId,
    [property: JsonPropertyName("warrantyContractId")] Guid? WarrantyContractId,
    [property: JsonPropertyName("parts")] List<ServiceEventPartCreateDto>? Parts);

public record ServiceEventDto(
    Guid EventId,
    Guid DeviceId,
    Guid ProviderId,
    Guid ServiceTypeId,
    DateTime OccurredAt,
    Guid? WarrantyContractId);

internal static class ServiceEventDtoMapper
{
    public static ServiceEventDto ToDto(ServiceEvent serviceEvent)
        => new(
            serviceEvent.EventId,
            serviceEvent.DeviceId,
            serviceEvent.ProviderId,
            serviceEvent.ServiceTypeId,
            serviceEvent.OccurredAt,
            serviceEvent.WarrantyContractId);

    public static IEnumerable<ServicePart> ToParts(IEnumerable<ServiceEventPartCreateDto>? parts)
    {
        if (parts is null)
        {
            return Enumerable.Empty<ServicePart>();
        }

        return parts.Select(p => new ServicePart(p.PartId, p.Qty, p.LineCost)).ToList();
    }
}
