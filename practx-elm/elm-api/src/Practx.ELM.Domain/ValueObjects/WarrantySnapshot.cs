namespace Practx.ELM.Domain.ValueObjects;

public record WarrantySnapshot(
    Guid? WarrantyContractId,
    Guid? WarrantyDefId,
    string? Name,
    DateOnly? EffectiveOn,
    DateOnly? ExpiresOn,
    IReadOnlyCollection<Guid> CoveredServiceTypeIds,
    WarrantyBadge Badge,
    WarrantyState State);
