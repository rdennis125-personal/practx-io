using Microsoft.EntityFrameworkCore;
using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.Ports;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Persistence.Sql;

internal sealed class SqlServiceEventRepository : IServiceEventRepository
{
    private readonly ElmDbContext _dbContext;

    public SqlServiceEventRepository(ElmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ServiceEvent> AddAsync(ServiceEvent serviceEvent, CancellationToken cancellationToken)
    {
        var entity = new SqlServiceEvent
        {
            EventId = serviceEvent.EventId,
            DeviceId = serviceEvent.DeviceId,
            ProviderId = serviceEvent.ProviderId,
            ServiceTypeId = serviceEvent.ServiceTypeId,
            OccurredAt = serviceEvent.OccurredAt,
            SpaceId = serviceEvent.SpaceId,
            WarrantyContractId = serviceEvent.WarrantyContractId,
            Parts = serviceEvent.Parts.Select(p => new SqlServiceEventPart
            {
                EventId = serviceEvent.EventId,
                PartId = p.PartId,
                Quantity = p.Quantity,
                LineCost = p.LineCost
            }).ToList()
        };

        _dbContext.ServiceEvents.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return serviceEvent;
    }

    public async Task<IReadOnlyCollection<ServiceEvent>> GetForDeviceAsync(Guid deviceId, CancellationToken cancellationToken)
    {
        var events = await _dbContext.ServiceEvents
            .AsNoTracking()
            .Where(e => e.DeviceId == deviceId)
            .Include(e => e.Parts)
            .OrderByDescending(e => e.OccurredAt)
            .ToListAsync(cancellationToken);

        return events
            .Select(e => new ServiceEvent(
                e.EventId,
                e.DeviceId,
                e.ProviderId,
                e.ServiceTypeId,
                e.OccurredAt,
                e.SpaceId,
                e.WarrantyContractId,
                e.Parts.Select(p => new ServicePart(p.PartId, p.Quantity, p.LineCost)).ToList()))
            .ToList();
    }
}
