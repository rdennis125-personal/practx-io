namespace Practx.Equipment.Api.Dtos;

public sealed record EquipmentUpdateRequest(
    string AssetId,
    string Type,
    string? Location,
    string? Manufacturer,
    string? Model,
    DateTime? InstalledDate,
    string? Status,
    DateTime? NextServiceDate,
    EquipmentMonitoringFlagsDto MonitoringFlags
);
