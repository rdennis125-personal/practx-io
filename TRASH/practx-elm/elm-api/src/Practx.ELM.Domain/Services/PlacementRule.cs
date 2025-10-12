using Practx.ELM.Domain.Entities;

namespace Practx.ELM.Domain.Services;

public record PlacementValidationResult(bool IsValid, string? ErrorMessage);

public class PlacementRule
{
    public PlacementValidationResult Validate(DeviceType deviceType, Guid? spaceId)
    {
        if (!deviceType.AllowsSpaceAssignments && spaceId is not null)
        {
            return new PlacementValidationResult(false, "Device type does not allow space assignments");
        }

        return new PlacementValidationResult(true, null);
    }
}
