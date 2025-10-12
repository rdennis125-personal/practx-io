using Microsoft.EntityFrameworkCore;
using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.Ports;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Persistence.Sql;

internal sealed class SqlDeviceRepository : IDeviceRepository
{
    private readonly ElmDbContext _dbContext;

    public SqlDeviceRepository(ElmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<Device>> GetDevicesForClinicAsync(Guid clinicId, Guid? typeId, DeviceStatus? status, string? search, CancellationToken cancellationToken)
    {
        var query = _dbContext.Devices
            .AsNoTracking()
            .Include(d => d.Spaces)
            .Where(d => d.ClinicId == clinicId);

        if (typeId is not null)
        {
            query = query.Where(d => d.DeviceTypeId == typeId);
        }

        if (status is not null)
        {
            query = query.Where(d => d.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(d => d.SerialNumber != null && EF.Functions.Like(d.SerialNumber!, $"%{search!}%"));
        }

        var devices = await query.ToListAsync(cancellationToken);
        var deviceTypes = await _dbContext.DeviceTypes.AsNoTracking().ToDictionaryAsync(x => x.DeviceTypeId, cancellationToken);
        var deviceModels = await _dbContext.DeviceModels.AsNoTracking().ToDictionaryAsync(x => x.DeviceModelId, cancellationToken);

        return devices
            .Select(d => MapDevice(d, includeEvents: false, deviceTypes, deviceModels))
            .ToList();
    }

    public async Task<Device?> GetDeviceWithDetailsAsync(Guid deviceId, CancellationToken cancellationToken)
    {
        var device = await _dbContext.Devices
            .AsNoTracking()
            .Include(d => d.Spaces)
            .Include(d => d.ServiceEvents)
                .ThenInclude(e => e.Parts)
            .SingleOrDefaultAsync(d => d.DeviceId == deviceId, cancellationToken);

        if (device is null)
        {
            return null;
        }

        var deviceTypes = await _dbContext.DeviceTypes.AsNoTracking().ToDictionaryAsync(x => x.DeviceTypeId, cancellationToken);
        var deviceModels = await _dbContext.DeviceModels.AsNoTracking().ToDictionaryAsync(x => x.DeviceModelId, cancellationToken);

        return MapDevice(device, includeEvents: true, deviceTypes, deviceModels);
    }

    private static Device MapDevice(SqlDevice entity, bool includeEvents, IReadOnlyDictionary<Guid, SqlDeviceType> deviceTypes, IReadOnlyDictionary<Guid, SqlDeviceModel> deviceModels)
    {
        var type = deviceTypes[entity.DeviceTypeId];
        var model = deviceModels[entity.DeviceModelId];

        var domainType = new DeviceType(type.DeviceTypeId, type.Name, type.AllowsSpaceAssignments);
        var domainModel = new DeviceModel(model.DeviceModelId, model.DeviceTypeId, model.ManufacturerId, model.Name);

        var spaces = entity.Spaces
            .Select(s => new DeviceSpaceAssignment(s.SpaceId, s.Name, s.Kind))
            .ToList();

        IReadOnlyCollection<ServiceEvent> events = Array.Empty<ServiceEvent>();
        if (includeEvents)
        {
            events = entity.ServiceEvents
                .OrderByDescending(e => e.OccurredAt)
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

        return new Device(
            entity.DeviceId,
            entity.ClinicId,
            entity.ManufacturerId,
            domainType,
            domainModel,
            entity.Status,
            entity.InstalledAt,
            entity.SerialNumber,
            entity.Notes,
            spaces,
            events);
    }
}
