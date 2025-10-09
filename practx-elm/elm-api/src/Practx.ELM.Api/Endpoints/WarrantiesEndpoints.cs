using Practx.ELM.Api.Dtos;
using Practx.ELM.Api.Validation;
using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.Ports;

namespace Practx.ELM.Api.Endpoints;

public static class WarrantiesEndpoints
{
    public static IEndpointRouteBuilder MapWarrantiesEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/warranties/contracts", async (
            WarrantyContractCreateDto request,
            IDeviceRepository deviceRepository,
            IWarrantyRepository warrantyRepository,
            CancellationToken cancellationToken) =>
        {
            var validation = WarrantyContractValidator.Validate(request);
            if (validation is not null)
            {
                return Results.ValidationProblem(validation);
            }

            var device = await deviceRepository.GetDeviceWithDetailsAsync(request.DeviceId, cancellationToken);
            if (device is null)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.DeviceId)] = new[] { "device not found" }
                });
            }

            if (device.ManufacturerId != request.ManufacturerId)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.ManufacturerId)] = new[] { "manufacturerId does not match the device manufacturer" }
                });
            }

            var definition = await warrantyRepository.GetDefinitionAsync(request.WarrantyDefId, cancellationToken);
            if (definition is null)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.WarrantyDefId)] = new[] { "warranty definition not found" }
                });
            }

            var effectiveOn = request.RegisteredOn;
            var expiresOn = definition.DurationMonths > 0
                ? effectiveOn.AddMonths(definition.DurationMonths).AddDays(-1)
                : effectiveOn;

            var contract = new WarrantyContract(
                Guid.NewGuid(),
                request.DeviceId,
                request.ManufacturerId,
                request.WarrantyDefId,
                effectiveOn,
                expiresOn,
                "active");

            await warrantyRepository.AddContractAsync(contract, cancellationToken);

            return Results.Created($"/warranties/contracts/{contract.WarrantyContractId}", WarrantyDtoMapper.ToDto(contract));
        })
        .WithName("CreateWarrantyContract")
        .WithTags("Warranties")
        .WithOpenApi();

        return endpoints;
    }
}
