using FluentAssertions;
using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.Services;

namespace Practx.ELM.Tests;

public class CertCheckerTests
{
    private readonly CertChecker _checker = new();
    private readonly Guid _providerId = Guid.NewGuid();
    private readonly Guid _manufacturerId = Guid.NewGuid();
    private readonly Guid _deviceTypeId = Guid.NewGuid();
    private readonly Guid _deviceModelId = Guid.NewGuid();

    [Fact]
    public void Validate_ReturnsTrue_WhenMatchingCertificationExists()
    {
        var certifications = new List<ProviderCertification>
        {
            new(Guid.NewGuid(), _providerId, _manufacturerId, _deviceTypeId, _deviceModelId, new DateOnly(2023, 1, 1), null)
        };

        var result = _checker.Validate(certifications, _providerId, _manufacturerId, _deviceTypeId, _deviceModelId, new DateTime(2024, 5, 1));

        result.IsCertified.Should().BeTrue();
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void Validate_ReturnsFalse_WhenNoCertificationMatches()
    {
        var certifications = new List<ProviderCertification>
        {
            new(Guid.NewGuid(), _providerId, _manufacturerId, _deviceTypeId, null, new DateOnly(2023, 1, 1), new DateOnly(2023, 12, 31))
        };

        var result = _checker.Validate(certifications, _providerId, _manufacturerId, _deviceTypeId, _deviceModelId, new DateTime(2024, 5, 1));

        result.IsCertified.Should().BeFalse();
        result.ErrorMessage.Should().Contain("valid certification");
    }
}
