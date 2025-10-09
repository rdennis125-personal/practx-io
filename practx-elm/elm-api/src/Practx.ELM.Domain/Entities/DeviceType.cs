namespace Practx.ELM.Domain.Entities;

public class DeviceType
{
    public DeviceType(Guid deviceTypeId, string name, bool allowsSpaceAssignments)
    {
        DeviceTypeId = deviceTypeId;
        Name = name;
        AllowsSpaceAssignments = allowsSpaceAssignments;
    }

    public Guid DeviceTypeId { get; }

    public string Name { get; }

    public bool AllowsSpaceAssignments { get; }
}
