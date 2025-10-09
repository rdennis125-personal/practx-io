namespace Practx.ELM.Domain.Entities;

public class Manufacturer
{
    public Manufacturer(Guid manufacturerId, string name)
    {
        ManufacturerId = manufacturerId;
        Name = name;
    }

    public Guid ManufacturerId { get; }

    public string Name { get; }
}
