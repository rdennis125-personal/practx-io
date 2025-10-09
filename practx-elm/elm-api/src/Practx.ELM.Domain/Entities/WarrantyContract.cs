using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Domain.Entities;

public class WarrantyContract
{
    public WarrantyContract(Guid warrantyContractId, Guid deviceId, Guid manufacturerId, Guid warrantyDefId, DateOnly effectiveOn, DateOnly expiresOn, string status)
    {
        WarrantyContractId = warrantyContractId;
        DeviceId = deviceId;
        ManufacturerId = manufacturerId;
        WarrantyDefId = warrantyDefId;
        EffectiveOn = effectiveOn;
        ExpiresOn = expiresOn;
        Status = status;
    }

    public Guid WarrantyContractId { get; }

    public Guid DeviceId { get; }

    public Guid ManufacturerId { get; }

    public Guid WarrantyDefId { get; }

    public DateOnly EffectiveOn { get; }

    public DateOnly ExpiresOn { get; }

    public string Status { get; }

    public WarrantyState GetState(DateOnly on)
    {
        if (on < EffectiveOn)
        {
            return WarrantyState.Expired; // not yet active; treat as expired for coverage
        }

        if (on > ExpiresOn)
        {
            return WarrantyState.Expired;
        }

        return WarrantyState.Active;
    }
}
