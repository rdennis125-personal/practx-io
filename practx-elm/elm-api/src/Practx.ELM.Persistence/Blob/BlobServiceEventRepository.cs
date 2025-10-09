using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.Ports;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Persistence.Blob;

internal sealed class BlobServiceEventRepository : IServiceEventRepository
{
    private readonly BlobDataStore _store;

    public BlobServiceEventRepository(BlobDataStore store)
    {
        _store = store;
    }

    public Task<ServiceEvent> AddAsync(ServiceEvent serviceEvent, CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        var entity = new BlobDataStore.BlobServiceEventEntity(
            serviceEvent.EventId,
            serviceEvent.DeviceId,
            serviceEvent.ProviderId,
            serviceEvent.ServiceTypeId,
            serviceEvent.OccurredAt,
            serviceEvent.SpaceId,
            serviceEvent.WarrantyContractId,
            serviceEvent.Parts.Select(p => new ServicePart(p.PartId, p.Quantity, p.LineCost)).ToList());
        _store.AddServiceEvent(entity);
        return Task.FromResult(serviceEvent);
    }

    public Task<IReadOnlyCollection<ServiceEvent>> GetForDeviceAsync(Guid deviceId, CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        var events = _store.GetServiceEvents()
            .Where(e => e.DeviceId == deviceId)
            .OrderByDescending(e => e.OccurredAt)
            .Select(Map)
            .ToList();
        return Task.FromResult<IReadOnlyCollection<ServiceEvent>>(events);
    }

    private static ServiceEvent Map(BlobDataStore.BlobServiceEventEntity entity)
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
