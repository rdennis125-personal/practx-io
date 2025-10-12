using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Domain.Ports;

public interface IDeviceRepository
{
    Task<IReadOnlyList<Device>> GetDevicesForClinicAsync(Guid clinicId, Guid? typeId, DeviceStatus? status, string? search, CancellationToken cancellationToken);

    Task<Device?> GetDeviceWithDetailsAsync(Guid deviceId, CancellationToken cancellationToken);
}
