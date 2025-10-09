using Microsoft.EntityFrameworkCore;
using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.Ports;

namespace Practx.ELM.Persistence.Sql;

internal sealed class SqlLookupRepository : ILookupRepository
{
    private readonly ElmDbContext _dbContext;

    public SqlLookupRepository(ElmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<ServiceType>> GetServiceTypesAsync(CancellationToken cancellationToken)
    {
        var serviceTypes = await _dbContext.ServiceTypes
            .AsNoTracking()
            .OrderBy(st => st.Name)
            .Select(st => new ServiceType(st.ServiceTypeId, st.Name))
            .ToListAsync(cancellationToken);
        return serviceTypes;
    }

    public async Task<IReadOnlyCollection<DeviceType>> GetDeviceTypesAsync(CancellationToken cancellationToken)
    {
        var deviceTypes = await _dbContext.DeviceTypes
            .AsNoTracking()
            .OrderBy(dt => dt.Name)
            .Select(dt => new DeviceType(dt.DeviceTypeId, dt.Name, dt.AllowsSpaceAssignments))
            .ToListAsync(cancellationToken);
        return deviceTypes;
    }

    public async Task<IReadOnlyCollection<Provider>> GetProvidersAsync(CancellationToken cancellationToken)
    {
        var providers = await _dbContext.Providers
            .AsNoTracking()
            .OrderBy(p => p.Name)
            .Select(p => new Provider(p.ProviderId, p.Name))
            .ToListAsync(cancellationToken);
        return providers;
    }

    public async Task<IReadOnlyCollection<ProviderCertification>> GetProviderCertificationsAsync(Guid providerId, CancellationToken cancellationToken)
    {
        var certifications = await _dbContext.ProviderCertifications
            .AsNoTracking()
            .Where(c => c.ProviderId == providerId)
            .Select(c => new ProviderCertification(
                c.CertificationId,
                c.ProviderId,
                c.ManufacturerId,
                c.DeviceTypeId,
                c.DeviceModelId,
                c.ValidFrom,
                c.ValidTo))
            .ToListAsync(cancellationToken);
        return certifications;
    }
}
