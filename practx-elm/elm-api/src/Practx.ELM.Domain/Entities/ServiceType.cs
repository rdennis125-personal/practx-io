namespace Practx.ELM.Domain.Entities;

public class ServiceType
{
    public ServiceType(Guid serviceTypeId, string name)
    {
        ServiceTypeId = serviceTypeId;
        Name = name;
    }

    public Guid ServiceTypeId { get; }

    public string Name { get; }
}
