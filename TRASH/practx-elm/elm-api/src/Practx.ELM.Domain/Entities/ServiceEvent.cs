using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Domain.Entities;

public class ServiceEvent
{
    public ServiceEvent(Guid eventId, Guid deviceId, Guid providerId, Guid serviceTypeId, DateTime occurredAt, Guid? spaceId, Guid? warrantyContractId, IEnumerable<ServicePart>? parts = null)
    {
        EventId = eventId;
        DeviceId = deviceId;
        ProviderId = providerId;
        ServiceTypeId = serviceTypeId;
        OccurredAt = occurredAt;
        SpaceId = spaceId;
        WarrantyContractId = warrantyContractId;
        Parts = parts?.ToList() ?? new List<ServicePart>();
    }

    public Guid EventId { get; }

    public Guid DeviceId { get; }

    public Guid ProviderId { get; }

    public Guid ServiceTypeId { get; }

    public DateTime OccurredAt { get; }

    public Guid? SpaceId { get; }

    public Guid? WarrantyContractId { get; }

    public IReadOnlyCollection<ServicePart> Parts { get; }
}
