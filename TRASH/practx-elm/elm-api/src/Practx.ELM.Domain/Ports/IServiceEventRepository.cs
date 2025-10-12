using Practx.ELM.Domain.Entities;

namespace Practx.ELM.Domain.Ports;

public interface IServiceEventRepository
{
    Task<ServiceEvent> AddAsync(ServiceEvent serviceEvent, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<ServiceEvent>> GetForDeviceAsync(Guid deviceId, CancellationToken cancellationToken);
}
