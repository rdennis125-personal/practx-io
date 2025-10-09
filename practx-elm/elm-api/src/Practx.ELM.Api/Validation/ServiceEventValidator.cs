using Practx.ELM.Api.Dtos;

namespace Practx.ELM.Api.Validation;

internal static class ServiceEventValidator
{
    public static Dictionary<string, string[]>? Validate(ServiceEventCreateDto dto)
    {
        var errors = new ValidationErrors();

        if (dto.DeviceId == Guid.Empty)
        {
            errors.Add(nameof(dto.DeviceId), "deviceId is required");
        }

        if (dto.ProviderId == Guid.Empty)
        {
            errors.Add(nameof(dto.ProviderId), "providerId is required");
        }

        if (dto.ServiceTypeId == Guid.Empty)
        {
            errors.Add(nameof(dto.ServiceTypeId), "serviceTypeId is required");
        }

        if (dto.OccurredAt == default)
        {
            errors.Add(nameof(dto.OccurredAt), "occurredAt is required");
        }

        if (dto.Parts is not null)
        {
            for (var index = 0; index < dto.Parts.Count; index++)
            {
                var part = dto.Parts[index];
                if (part.Qty < 1)
                {
                    errors.Add($"parts[{index}].qty", "qty must be at least 1");
                }
            }
        }

        return errors.Build();
    }
}
