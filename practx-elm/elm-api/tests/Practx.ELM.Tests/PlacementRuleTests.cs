using FluentAssertions;
using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.Services;

namespace Practx.ELM.Tests;

public class PlacementRuleTests
{
    private readonly PlacementRule _rule = new();

    [Fact]
    public void Validate_ReturnsError_WhenInstrumentHasSpace()
    {
        var instrumentType = new DeviceType(Guid.NewGuid(), "Instrument", allowsSpaceAssignments: false);

        var result = _rule.Validate(instrumentType, Guid.NewGuid());

        result.IsValid.Should().BeFalse();
        result.ErrorMessage.Should().Contain("does not allow space assignments");
    }

    [Fact]
    public void Validate_ReturnsValid_WhenChairHasSpace()
    {
        var chairType = new DeviceType(Guid.NewGuid(), "Chair", allowsSpaceAssignments: true);

        var result = _rule.Validate(chairType, Guid.NewGuid());

        result.IsValid.Should().BeTrue();
    }
}
