using Practx.ELM.Api.Dtos;
using Practx.ELM.Domain.Ports;

namespace Practx.ELM.Api.Endpoints;

public static class LookupsEndpoints
{
    public static IEndpointRouteBuilder MapLookupsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/lookups/service-types", async (ILookupRepository lookupRepository, CancellationToken cancellationToken) =>
        {
            var serviceTypes = await lookupRepository.GetServiceTypesAsync(cancellationToken);
            return Results.Ok(serviceTypes.Select(LookupDtoMapper.FromServiceType));
        })
        .WithName("GetServiceTypesLookup")
        .WithTags("Lookups")
        .WithOpenApi();

        endpoints.MapGet("/lookups/device-types", async (ILookupRepository lookupRepository, CancellationToken cancellationToken) =>
        {
            var deviceTypes = await lookupRepository.GetDeviceTypesAsync(cancellationToken);
            return Results.Ok(deviceTypes.Select(LookupDtoMapper.FromDeviceType));
        })
        .WithName("GetDeviceTypesLookup")
        .WithTags("Lookups")
        .WithOpenApi();

        endpoints.MapGet("/lookups/providers", async (ILookupRepository lookupRepository, CancellationToken cancellationToken) =>
        {
            var providers = await lookupRepository.GetProvidersAsync(cancellationToken);
            return Results.Ok(providers.Select(LookupDtoMapper.FromProvider));
        })
        .WithName("GetProvidersLookup")
        .WithTags("Lookups")
        .WithOpenApi();

        return endpoints;
    }
}
