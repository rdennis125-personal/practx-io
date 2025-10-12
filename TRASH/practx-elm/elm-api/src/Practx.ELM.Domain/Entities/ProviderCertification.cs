namespace Practx.ELM.Domain.Entities;

public class ProviderCertification
{
    public ProviderCertification(Guid certificationId, Guid providerId, Guid manufacturerId, Guid deviceTypeId, Guid? deviceModelId, DateOnly validFrom, DateOnly? validTo)
    {
        CertificationId = certificationId;
        ProviderId = providerId;
        ManufacturerId = manufacturerId;
        DeviceTypeId = deviceTypeId;
        DeviceModelId = deviceModelId;
        ValidFrom = validFrom;
        ValidTo = validTo;
    }

    public Guid CertificationId { get; }

    public Guid ProviderId { get; }

    public Guid ManufacturerId { get; }

    public Guid DeviceTypeId { get; }

    public Guid? DeviceModelId { get; }

    public DateOnly ValidFrom { get; }

    public DateOnly? ValidTo { get; }

    public bool IsValidOn(DateOnly date) => date >= ValidFrom && (ValidTo is null || date <= ValidTo);
}
