using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Domain.Services;

public record WarrantyValidationResult(bool IsValid, string? ErrorMessage);

public class WarrantyValidator
{
    public WarrantyValidationResult Validate(WarrantyContract? contract, WarrantyDefinition? definition, DateOnly onDate, Guid serviceTypeId)
    {
        if (contract is null)
        {
            return new WarrantyValidationResult(false, "Warranty contract not found");
        }

        if (definition is null)
        {
            return new WarrantyValidationResult(false, "Warranty definition not found");
        }

        if (definition.WarrantyDefId != contract.WarrantyDefId)
        {
            return new WarrantyValidationResult(false, "Warranty definition mismatch");
        }

        if (!definition.CoveredServiceTypeIds.Contains(serviceTypeId))
        {
            return new WarrantyValidationResult(false, "Service type not covered by warranty");
        }

        var state = contract.GetState(onDate);
        if (state != WarrantyState.Active)
        {
            return new WarrantyValidationResult(false, "Warranty is not active on the service date");
        }

        return new WarrantyValidationResult(true, null);
    }

    public WarrantySnapshot BuildSnapshot(WarrantyContract? contract, WarrantyDefinition? definition, DateOnly onDate)
    {
        if (contract is null || definition is null)
        {
            return new WarrantySnapshot(null, null, null, null, null, Array.Empty<Guid>(), WarrantyBadge.None, WarrantyState.None);
        }

        var state = contract.GetState(onDate);
        var badge = state switch
        {
            WarrantyState.Active => WarrantyBadge.Active,
            WarrantyState.Expired => WarrantyBadge.Expired,
            _ => WarrantyBadge.None
        };

        return new WarrantySnapshot(
            contract.WarrantyContractId,
            contract.WarrantyDefId,
            definition.Name,
            contract.EffectiveOn,
            contract.ExpiresOn,
            definition.CoveredServiceTypeIds,
            badge,
            state);
    }
}
