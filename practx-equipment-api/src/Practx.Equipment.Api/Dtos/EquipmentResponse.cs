namespace Practx.Equipment.Api.Dtos;

public sealed record EquipmentResponse(
    Guid Id,
    string AssetId,
    string Type,
    string? Location,
    string? Manufacturer,
    string? Model,
    DateTime? InstalledDate,
    string Status,
    DateTime? NextServiceDate,
    EquipmentMonitoringFlagsDto MonitoringFlags,
    decimal SpendYearToDate,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);
