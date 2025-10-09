using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Api.Dtos;

public record WarrantyActiveDto(
    Guid? WarrantyContractId,
    Guid? WarrantyDefId,
    string? Name,
    DateOnly? EffectiveOn,
    DateOnly? ExpiresOn,
    IReadOnlyCollection<Guid> CoveredServiceTypeIds,
    string Status);

public record WarrantyContractCreateDto(
    Guid DeviceId,
    Guid ManufacturerId,
    Guid WarrantyDefId,
    DateOnly RegisteredOn);

public record WarrantyContractDto(
    Guid WarrantyContractId,
    Guid DeviceId,
    Guid ManufacturerId,
    Guid WarrantyDefId,
    DateOnly EffectiveOn,
    DateOnly ExpiresOn,
    string Status);

internal static class WarrantyDtoMapper
{
    public static WarrantyActiveDto ToActive(WarrantySnapshot snapshot)
        => new(
            snapshot.WarrantyContractId,
            snapshot.WarrantyDefId,
            snapshot.Name,
            snapshot.EffectiveOn,
            snapshot.ExpiresOn,
            snapshot.CoveredServiceTypeIds,
            SnapshotStatus(snapshot));

    public static WarrantyContractDto ToDto(WarrantyContract contract)
        => new(
            contract.WarrantyContractId,
            contract.DeviceId,
            contract.ManufacturerId,
            contract.WarrantyDefId,
            contract.EffectiveOn,
            contract.ExpiresOn,
            contract.Status);

    private static string SnapshotStatus(WarrantySnapshot snapshot) => snapshot.Badge switch
    {
        WarrantyBadge.Active => "active",
        WarrantyBadge.Expired => "expired",
        _ => "none"
    };
}
