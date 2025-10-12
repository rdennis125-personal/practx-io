using Practx.ELM.Api.Dtos;
using Practx.ELM.Domain.Ports;
using Practx.ELM.Domain.Services;
using Practx.ELM.Domain.ValueObjects;

namespace Practx.ELM.Api.Endpoints;

public static class DevicesEndpoints
{
    public static IEndpointRouteBuilder MapDevicesEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/clinics/{clinicId:guid}/devices", async (
            Guid clinicId,
            Guid? typeId,
            string? status,
            string? search,
            IDeviceRepository deviceRepository,
            IWarrantyRepository warrantyRepository,
            WarrantyValidator warrantyValidator,
            CancellationToken cancellationToken) =>
        {
            if (!TryParseStatus(status, out var deviceStatus, out var statusError))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["status"] = new[] { statusError! }
                });
            }

            var devices = await deviceRepository.GetDevicesForClinicAsync(clinicId, typeId, deviceStatus, search, cancellationToken);
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var results = new List<DeviceListItemDto>(devices.Count);

            foreach (var device in devices)
            {
                var (contract, definition) = await warrantyRepository.GetLatestWarrantyAsync(device.DeviceId, cancellationToken);
                var snapshot = warrantyValidator.BuildSnapshot(contract, definition, today);
                results.Add(DeviceDtoMapper.ToListItem(device, snapshot));
            }

            return Results.Ok(results);
        })
        .WithName("GetClinicDevices")
        .WithTags("Devices")
        .WithOpenApi();

        endpoints.MapGet("/devices/{deviceId:guid}", async (
            Guid deviceId,
            IDeviceRepository deviceRepository,
            IWarrantyRepository warrantyRepository,
            WarrantyValidator warrantyValidator,
            CancellationToken cancellationToken) =>
        {
            var device = await deviceRepository.GetDeviceWithDetailsAsync(deviceId, cancellationToken);
            if (device is null)
            {
                return Results.NotFound();
            }

            var (contract, definition) = await warrantyRepository.GetLatestWarrantyAsync(device.DeviceId, cancellationToken);
            var snapshot = warrantyValidator.BuildSnapshot(contract, definition, DateOnly.FromDateTime(DateTime.UtcNow));

            return Results.Ok(DeviceDtoMapper.ToDetail(device, snapshot));
        })
        .WithName("GetDeviceDetail")
        .WithTags("Devices")
        .WithOpenApi();

        endpoints.MapGet("/devices/{deviceId:guid}/warranty/active", async (
            Guid deviceId,
            string on,
            IWarrantyRepository warrantyRepository,
            WarrantyValidator warrantyValidator,
            CancellationToken cancellationToken) =>
        {
            if (!DateOnly.TryParse(on, out var onDate))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["on"] = new[] { "on must be a valid date in yyyy-MM-dd format" }
                });
            }

            var (contract, definition) = await warrantyRepository.GetActiveWarrantyAsync(deviceId, onDate, cancellationToken);
            var snapshot = warrantyValidator.BuildSnapshot(contract, definition, onDate);
            return Results.Ok(WarrantyDtoMapper.ToActive(snapshot));
        })
        .WithName("GetDeviceActiveWarranty")
        .WithTags("Warranties")
        .WithOpenApi();

        return endpoints;
    }

    private static bool TryParseStatus(string? value, out DeviceStatus? status, out string? error)
    {
        status = null;
        error = null;
        if (string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        switch (value.Trim().ToLowerInvariant())
        {
            case "active":
                status = DeviceStatus.Active;
                return true;
            case "in_repair":
                status = DeviceStatus.InRepair;
                return true;
            case "retired":
                status = DeviceStatus.Retired;
                return true;
            default:
                error = "status must be one of active, in_repair, retired";
                return false;
        }
    }
}
