namespace Practx.ELM.Domain.Entities;

public class DeviceModel
{
    public DeviceModel(Guid deviceModelId, Guid deviceTypeId, Guid manufacturerId, string name)
    {
        DeviceModelId = deviceModelId;
        DeviceTypeId = deviceTypeId;
        ManufacturerId = manufacturerId;
        Name = name;
    }

    public Guid DeviceModelId { get; }

    public Guid DeviceTypeId { get; }

    public Guid ManufacturerId { get; }

    public string Name { get; }
}
