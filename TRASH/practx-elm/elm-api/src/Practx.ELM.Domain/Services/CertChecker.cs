using Practx.ELM.Domain.Entities;

namespace Practx.ELM.Domain.Services;

public record CertificationResult(bool IsCertified, string? ErrorMessage);

public class CertChecker
{
    public CertificationResult Validate(IEnumerable<ProviderCertification> certifications, Guid providerId, Guid manufacturerId, Guid deviceTypeId, Guid? deviceModelId, DateTime occurredAt)
    {
        var serviceDate = DateOnly.FromDateTime(occurredAt);
        var matches = certifications.Where(c =>
            c.ProviderId == providerId &&
            c.ManufacturerId == manufacturerId &&
            c.DeviceTypeId == deviceTypeId &&
            (c.DeviceModelId is null || deviceModelId == c.DeviceModelId) &&
            c.IsValidOn(serviceDate));

        if (matches.Any())
        {
            return new CertificationResult(true, null);
        }

        return new CertificationResult(false, "Provider does not hold a valid certification for this service");
    }
}
