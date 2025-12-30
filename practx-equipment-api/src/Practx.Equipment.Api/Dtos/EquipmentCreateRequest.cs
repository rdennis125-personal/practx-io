namespace Practx.Equipment.Api.Dtos;

public sealed record EquipmentCreateRequest(
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

public sealed record EquipmentMonitoringFlagsDto(
    bool TelemetryEnabled,
    bool MaintenanceAutoCreate,
    bool SafetyAlerts
);
