using Practx.ELM.Domain.Entities;

namespace Practx.ELM.Api.Dtos;

public record LookupDto(Guid Id, string Name);

internal static class LookupDtoMapper
{
    public static LookupDto FromDeviceType(DeviceType type) => new(type.DeviceTypeId, type.Name);

    public static LookupDto FromServiceType(ServiceType type) => new(type.ServiceTypeId, type.Name);

    public static LookupDto FromProvider(Provider provider) => new(provider.ProviderId, provider.Name);
}
