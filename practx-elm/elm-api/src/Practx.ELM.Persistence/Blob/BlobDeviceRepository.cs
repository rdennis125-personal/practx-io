using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.Ports;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Persistence.Blob;

internal sealed class BlobDeviceRepository : IDeviceRepository
{
    private readonly BlobDataStore _store;

    public BlobDeviceRepository(BlobDataStore store)
    {
        _store = store;
    }

    public Task<IReadOnlyList<Device>> GetDevicesForClinicAsync(Guid clinicId, Guid? typeId, DeviceStatus? status, string? search, CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        var devices = _store.GetDevices()
            .Where(d => d.ClinicId == clinicId)
            .Where(d => typeId is null || d.DeviceTypeId == typeId)
            .Where(d => status is null || d.Status == status)
            .Where(d => string.IsNullOrWhiteSpace(search) || (d.SerialNumber?.Contains(search!, StringComparison.OrdinalIgnoreCase) ?? false))
            .Select(d => MapDevice(d, includeEvents: false))
            .ToList();

        return Task.FromResult<IReadOnlyList<Device>>(devices);
    }

    public Task<Device?> GetDeviceWithDetailsAsync(Guid deviceId, CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        var entity = _store.GetDevices().SingleOrDefault(d => d.DeviceId == deviceId);
        if (entity is null)
        {
            return Task.FromResult<Device?>(null);
        }

        var device = MapDevice(entity, includeEvents: true);
        return Task.FromResult<Device?>(device);
    }

    private Device MapDevice(BlobDataStore.BlobDeviceEntity entity, bool includeEvents)
    {
        var deviceType = _store.GetDeviceTypes().Single(dt => dt.DeviceTypeId == entity.DeviceTypeId);
        var deviceModel = _store.GetDeviceModels().Single(dm => dm.DeviceModelId == entity.DeviceModelId);
        var spaces = _store.GetDeviceSpaces()
            .Where(s => s.DeviceId == entity.DeviceId)
            .Select(s => new DeviceSpaceAssignment(s.SpaceId, s.Name, s.Kind))
            .ToList();

        IReadOnlyCollection<ServiceEvent> events = Array.Empty<ServiceEvent>();
        if (includeEvents)
        {
            events = _store.GetServiceEvents()
                .Where(e => e.DeviceId == entity.DeviceId)
                .OrderByDescending(e => e.OccurredAt)
                .Select(MapEvent)
                .ToList();
        }

        return new Device(
            entity.DeviceId,
            entity.ClinicId,
            entity.ManufacturerId,
            deviceType,
            deviceModel,
            entity.Status,
            entity.InstalledAt,
            entity.SerialNumber,
            entity.Notes,
            spaces,
            events);
    }

    private static ServiceEvent MapEvent(BlobDataStore.BlobServiceEventEntity entity)
        => new(
            entity.EventId,
            entity.DeviceId,
            entity.ProviderId,
            entity.ServiceTypeId,
            entity.OccurredAt,
            entity.SpaceId,
            entity.WarrantyContractId,
            entity.Parts.Select(p => new ServicePart(p.PartId, p.Quantity, p.LineCost)).ToList());
}
