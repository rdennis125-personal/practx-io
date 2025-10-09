using FluentAssertions;
using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.Services;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Tests;

public class WarrantyValidatorTests
{
    private readonly WarrantyValidator _validator = new();
    private readonly Guid _serviceTypeId = Guid.NewGuid();

    [Fact]
    public void Validate_ReturnsSuccess_WhenContractActiveAndCovered()
    {
        var definition = new WarrantyDefinition(Guid.NewGuid(), Guid.NewGuid(), "Standard", new[] { _serviceTypeId }, 12);
        var contract = new WarrantyContract(Guid.NewGuid(), Guid.NewGuid(), definition.ManufacturerId, definition.WarrantyDefId, new DateOnly(2024, 1, 1), new DateOnly(2024, 12, 31), "active");

        var result = _validator.Validate(contract, definition, new DateOnly(2024, 6, 1), _serviceTypeId);

        result.IsValid.Should().BeTrue();
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void Validate_ReturnsError_WhenServiceTypeNotCovered()
    {
        var definition = new WarrantyDefinition(Guid.NewGuid(), Guid.NewGuid(), "Standard", new[] { Guid.NewGuid() }, 12);
        var contract = new WarrantyContract(Guid.NewGuid(), Guid.NewGuid(), definition.ManufacturerId, definition.WarrantyDefId, new DateOnly(2024, 1, 1), new DateOnly(2024, 12, 31), "active");

        var result = _validator.Validate(contract, definition, new DateOnly(2024, 6, 1), _serviceTypeId);

        result.IsValid.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Service type not covered");
    }

    [Fact]
    public void Validate_ReturnsError_WhenContractNotActiveOnDate()
    {
        var definition = new WarrantyDefinition(Guid.NewGuid(), Guid.NewGuid(), "Standard", new[] { _serviceTypeId }, 12);
        var contract = new WarrantyContract(Guid.NewGuid(), Guid.NewGuid(), definition.ManufacturerId, definition.WarrantyDefId, new DateOnly(2024, 1, 1), new DateOnly(2024, 12, 31), "active");

        var result = _validator.Validate(contract, definition, new DateOnly(2025, 1, 1), _serviceTypeId);

        result.IsValid.Should().BeFalse();
        result.ErrorMessage.Should().Contain("not active");
    }
}
