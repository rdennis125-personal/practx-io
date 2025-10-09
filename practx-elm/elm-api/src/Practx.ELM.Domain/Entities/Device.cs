using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Domain.Entities;

public class Device
{
    public Device(
        Guid deviceId,
        Guid clinicId,
        Guid manufacturerId,
        DeviceType deviceType,
        DeviceModel deviceModel,
        DeviceStatus status,
        DateTime? installedAt,
        string? serialNumber,
        string? notes,
        IEnumerable<DeviceSpaceAssignment>? spaces = null,
        IEnumerable<ServiceEvent>? serviceEvents = null)
    {
        DeviceId = deviceId;
        ClinicId = clinicId;
        ManufacturerId = manufacturerId;
        DeviceType = deviceType;
        DeviceModel = deviceModel;
        Status = status;
        InstalledAt = installedAt;
        SerialNumber = serialNumber;
        Notes = notes;
        Spaces = spaces?.ToList() ?? new List<DeviceSpaceAssignment>();
        ServiceEvents = serviceEvents?.ToList() ?? new List<ServiceEvent>();
    }

    public Guid DeviceId { get; }

    public Guid ClinicId { get; }

    public Guid ManufacturerId { get; }

    public DeviceType DeviceType { get; }

    public DeviceModel DeviceModel { get; }

    public DeviceStatus Status { get; }

    public DateTime? InstalledAt { get; }

    public string? SerialNumber { get; }

    public string? Notes { get; }

    public IReadOnlyCollection<DeviceSpaceAssignment> Spaces { get; }

    public IReadOnlyCollection<ServiceEvent> ServiceEvents { get; }
}
