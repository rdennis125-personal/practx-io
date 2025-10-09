using Practx.ELM.Api.Dtos;
using Practx.ELM.Api.Validation;
using Practx.ELM.Domain.Entities;
using Practx.ELM.Domain.Ports;
using Practx.ELM.Domain.Services;

namespace Practx.ELM.Api.Endpoints;

public static class ServiceEventsEndpoints
{
    public static IEndpointRouteBuilder MapServiceEventsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/service-events", async (
            ServiceEventCreateDto request,
            IDeviceRepository deviceRepository,
            IServiceEventRepository serviceEventRepository,
            IWarrantyRepository warrantyRepository,
            ILookupRepository lookupRepository,
            CertChecker certChecker,
            PlacementRule placementRule,
            WarrantyValidator warrantyValidator,
            CancellationToken cancellationToken) =>
        {
            var validation = ServiceEventValidator.Validate(request);
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

            if (request.SpaceId.HasValue && device.Spaces.All(s => s.SpaceId != request.SpaceId.Value))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.SpaceId)] = new[] { "space is not assigned to this device" }
                });
            }

            var placementResult = placementRule.Validate(device.DeviceType, request.SpaceId);
            if (!placementResult.IsValid)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.SpaceId)] = new[] { placementResult.ErrorMessage ?? "invalid placement" }
                });
            }

            var certifications = await lookupRepository.GetProviderCertificationsAsync(request.ProviderId, cancellationToken);
            var certificationResult = certChecker.Validate(
                certifications,
                request.ProviderId,
                device.ManufacturerId,
                device.DeviceType.DeviceTypeId,
                device.DeviceModel.DeviceModelId,
                request.OccurredAt);

            if (!certificationResult.IsCertified)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.ProviderId)] = new[] { certificationResult.ErrorMessage ?? "provider not certified" }
                });
            }

            if (request.WarrantyContractId.HasValue)
            {
                var contract = await warrantyRepository.GetContractAsync(request.WarrantyContractId.Value, cancellationToken);
                if (contract is null)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]>
                    {
                        [nameof(request.WarrantyContractId)] = new[] { "warranty contract not found" }
                    });
                }

                if (contract.DeviceId != request.DeviceId)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]>
                    {
                        [nameof(request.WarrantyContractId)] = new[] { "warranty contract does not belong to the device" }
                    });
                }

                var definition = await warrantyRepository.GetDefinitionAsync(contract.WarrantyDefId, cancellationToken);
                var warrantyCheck = warrantyValidator.Validate(
                    contract,
                    definition,
                    DateOnly.FromDateTime(request.OccurredAt),
                    request.ServiceTypeId);

                if (!warrantyCheck.IsValid)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]>
                    {
                        [nameof(request.WarrantyContractId)] = new[] { warrantyCheck.ErrorMessage ?? "warranty invalid" }
                    });
                }
            }

            var parts = ServiceEventDtoMapper.ToParts(request.Parts);
            var domainEvent = new ServiceEvent(
                Guid.NewGuid(),
                request.DeviceId,
                request.ProviderId,
                request.ServiceTypeId,
                request.OccurredAt,
                request.SpaceId,
                request.WarrantyContractId,
                parts);

            var saved = await serviceEventRepository.AddAsync(domainEvent, cancellationToken);

            return Results.Created($"/service-events/{saved.EventId}", ServiceEventDtoMapper.ToDto(saved));
        })
        .WithName("CreateServiceEvent")
        .WithTags("ServiceEvents")
        .WithOpenApi();

        return endpoints;
    }
}
