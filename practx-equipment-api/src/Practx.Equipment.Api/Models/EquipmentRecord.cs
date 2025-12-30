namespace Practx.Equipment.Api.Models;

public sealed record EquipmentRecord
{
    public Guid Id { get; init; }
    public string AssetId { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string? Location { get; init; }
    public string? Manufacturer { get; init; }
    public string? Model { get; init; }
    public DateTime? InstalledDate { get; init; }
    public EquipmentStatus Status { get; init; }
    public DateTime? NextServiceDate { get; init; }
    public EquipmentMonitoringFlags MonitoringFlags { get; init; } = new(false, false, false);
    public decimal SpendYearToDate { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
}
