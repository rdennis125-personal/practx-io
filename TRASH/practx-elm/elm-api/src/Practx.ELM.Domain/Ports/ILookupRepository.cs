using Practx.ELM.Domain.Entities;

namespace Practx.ELM.Domain.Ports;

public interface ILookupRepository
{
    Task<IReadOnlyCollection<ServiceType>> GetServiceTypesAsync(CancellationToken cancellationToken);

    Task<IReadOnlyCollection<DeviceType>> GetDeviceTypesAsync(CancellationToken cancellationToken);

    Task<IReadOnlyCollection<Provider>> GetProvidersAsync(CancellationToken cancellationToken);

    Task<IReadOnlyCollection<ProviderCertification>> GetProviderCertificationsAsync(Guid providerId, CancellationToken cancellationToken);
}
