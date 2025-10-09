namespace Practx.ELM.Domain.Entities;

public class WarrantyDefinition
{
    public WarrantyDefinition(Guid warrantyDefId, Guid manufacturerId, string name, IReadOnlyCollection<Guid> coveredServiceTypeIds, int durationMonths)
    {
        WarrantyDefId = warrantyDefId;
        ManufacturerId = manufacturerId;
        Name = name;
        CoveredServiceTypeIds = coveredServiceTypeIds;
        DurationMonths = durationMonths;
    }

    public Guid WarrantyDefId { get; }

    public Guid ManufacturerId { get; }

    public string Name { get; }

    public IReadOnlyCollection<Guid> CoveredServiceTypeIds { get; }

    public int DurationMonths { get; }
}
