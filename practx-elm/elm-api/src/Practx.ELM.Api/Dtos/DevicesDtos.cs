using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Api.Dtos;

public record DeviceListItemDto(
    Guid DeviceId,
    Guid DeviceTypeId,
    string DeviceTypeName,
    Guid DeviceModelId,
    string DeviceModelName,
    string Status,
    DateTime? InstalledAt,
    string? SerialNumber,
    string WarrantyBadge);

public record DeviceSpaceDto(Guid SpaceId, string Name, string Kind);

public record DeviceDetailDto(
    Guid DeviceId,
    Guid DeviceTypeId,
    string DeviceTypeName,
    Guid DeviceModelId,
    string DeviceModelName,
    string Status,
    DateTime? InstalledAt,
    string? SerialNumber,
    string WarrantyBadge,
    string? Notes,
    IReadOnlyList<DeviceSpaceDto> Spaces,
    IReadOnlyList<ServiceEventDto> ServiceEvents) : DeviceListItemDto(
        DeviceId,
        DeviceTypeId,
        DeviceTypeName,
        DeviceModelId,
        DeviceModelName,
        Status,
        InstalledAt,
        SerialNumber,
        WarrantyBadge);

internal static class DeviceDtoMapper
{
    public static DeviceListItemDto ToListItem(Device device, WarrantySnapshot warranty)
        => new(
            device.DeviceId,
            device.DeviceType.DeviceTypeId,
            device.DeviceType.Name,
            device.DeviceModel.DeviceModelId,
            device.DeviceModel.Name,
            DeviceStatusToString(device.Status),
            device.InstalledAt,
            device.SerialNumber,
            WarrantyBadgeToString(warranty.Badge));

    public static DeviceDetailDto ToDetail(Device device, WarrantySnapshot warranty)
        => new(
            device.DeviceId,
            device.DeviceType.DeviceTypeId,
            device.DeviceType.Name,
            device.DeviceModel.DeviceModelId,
            device.DeviceModel.Name,
            DeviceStatusToString(device.Status),
            device.InstalledAt,
            device.SerialNumber,
            WarrantyBadgeToString(warranty.Badge),
            device.Notes,
            device.Spaces.Select(s => new DeviceSpaceDto(s.SpaceId, s.Name, s.Kind)).ToList(),
            device.ServiceEvents.Select(ServiceEventDtoMapper.ToDto).ToList());

    private static string DeviceStatusToString(DeviceStatus status) => status switch
    {
        DeviceStatus.Active => "active",
        DeviceStatus.InRepair => "in_repair",
        DeviceStatus.Retired => "retired",
        _ => "active"
    };

    private static string WarrantyBadgeToString(WarrantyBadge badge) => badge switch
    {
        WarrantyBadge.Active => "active",
        WarrantyBadge.Expired => "expired",
        _ => "none"
    };
}
