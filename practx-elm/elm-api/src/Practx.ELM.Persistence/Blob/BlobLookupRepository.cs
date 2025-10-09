using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.Ports;

namespace Practx.ELM.Persistence.Blob;

internal sealed class BlobLookupRepository : ILookupRepository
{
    private readonly BlobDataStore _store;

    public BlobLookupRepository(BlobDataStore store)
    {
        _store = store;
    }

    public Task<IReadOnlyCollection<ServiceType>> GetServiceTypesAsync(CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        var serviceTypes = _store.GetServiceTypes().OrderBy(st => st.Name).ToList();
        return Task.FromResult<IReadOnlyCollection<ServiceType>>(serviceTypes);
    }

    public Task<IReadOnlyCollection<DeviceType>> GetDeviceTypesAsync(CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        var deviceTypes = _store.GetDeviceTypes().OrderBy(dt => dt.Name).ToList();
        return Task.FromResult<IReadOnlyCollection<DeviceType>>(deviceTypes);
    }

    public Task<IReadOnlyCollection<Provider>> GetProvidersAsync(CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        var providers = _store.GetProviders().OrderBy(p => p.Name).ToList();
        return Task.FromResult<IReadOnlyCollection<Provider>>(providers);
    }

    public Task<IReadOnlyCollection<ProviderCertification>> GetProviderCertificationsAsync(Guid providerId, CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        var certifications = _store.GetProviderCertifications()
            .Where(c => c.ProviderId == providerId)
            .ToList();
        return Task.FromResult<IReadOnlyCollection<ProviderCertification>>(certifications);
    }
}
