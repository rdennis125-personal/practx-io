using Practx.ELM.Api.Dtos;

namespace Practx.ELM.Api.Validation;

internal static class WarrantyContractValidator
{
    public static Dictionary<string, string[]>? Validate(WarrantyContractCreateDto dto)
    {
        var errors = new ValidationErrors();

        if (dto.DeviceId == Guid.Empty)
        {
            errors.Add(nameof(dto.DeviceId), "deviceId is required");
        }

        if (dto.ManufacturerId == Guid.Empty)
        {
            errors.Add(nameof(dto.ManufacturerId), "manufacturerId is required");
        }

        if (dto.WarrantyDefId == Guid.Empty)
        {
            errors.Add(nameof(dto.WarrantyDefId), "warrantyDefId is required");
        }

        if (dto.RegisteredOn == default)
        {
            errors.Add(nameof(dto.RegisteredOn), "registeredOn is required");
        }

        return errors.Build();
    }
}
