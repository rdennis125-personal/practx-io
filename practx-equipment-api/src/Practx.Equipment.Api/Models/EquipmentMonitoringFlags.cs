namespace Practx.Equipment.Api.Models;

public sealed record EquipmentMonitoringFlags(
    bool TelemetryEnabled,
    bool MaintenanceAutoCreate,
    bool SafetyAlerts
);
