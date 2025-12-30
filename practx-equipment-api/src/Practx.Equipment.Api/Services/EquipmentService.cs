using Practx.Equipment.Api.Data;
using Practx.Equipment.Api.Dtos;
using Practx.Equipment.Api.Models;

namespace Practx.Equipment.Api.Services;

public sealed class EquipmentService : IEquipmentService
{
    private static readonly HashSet<string> AllowedSortKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        "spendYtd",
        "nextService",
    };

    private static readonly HashSet<string> AllowedDirections = new(StringComparer.OrdinalIgnoreCase)
    {
        "asc",
        "desc",
    };

    private readonly IEquipmentRepository _repository;

    public EquipmentService(IEquipmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<EquipmentResponse> CreateAsync(EquipmentCreateRequest request, CancellationToken cancellationToken)
    {
        var validation = Validate(request.AssetId, request.Type, request.InstalledDate, request.NextServiceDate, request.Status);
        if (validation is not null)
        {
            throw new InvalidOperationException(validation);
        }

        var existing = await _repository.GetByAssetIdAsync(request.AssetId.Trim(), cancellationToken);
        if (existing is not null)
        {
            throw new InvalidOperationException($"Asset {request.AssetId} already exists.");
        }

        var now = DateTimeOffset.UtcNow;
        var monitoringFlags = request.MonitoringFlags ?? new EquipmentMonitoringFlagsDto(false, false, false);
        var record = new EquipmentRecord
        {
            Id = Guid.NewGuid(),
            AssetId = request.AssetId.Trim(),
            Type = request.Type.Trim(),
            Location = NormalizeString(request.Location),
            Manufacturer = NormalizeString(request.Manufacturer),
            Model = NormalizeString(request.Model),
            InstalledDate = request.InstalledDate,
            Status = ParseStatusOrDefault(request.Status),
            NextServiceDate = request.NextServiceDate,
            MonitoringFlags = new EquipmentMonitoringFlags(
                monitoringFlags.TelemetryEnabled,
                monitoringFlags.MaintenanceAutoCreate,
                monitoringFlags.SafetyAlerts
            ),
            SpendYearToDate = 0,
            CreatedAt = now,
            UpdatedAt = now,
        };

        await _repository.CreateAsync(record, cancellationToken);
        return ToResponse(record);
    }

    public async Task<EquipmentResponse?> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        var record = await _repository.GetByIdAsync(id, cancellationToken);
        return record is null ? null : ToResponse(record);
    }

    public async Task<EquipmentListResponse> ListAsync(string? search, string? status, string? sort, string? direction, int? limit, int? offset, CancellationToken cancellationToken)
    {
        var parsedStatus = ParseStatusFilter(status);
        var sortKey = ParseSortKey(sort);
        var sortDirection = ParseSortDirection(direction);
        var query = new EquipmentQuery(
            string.IsNullOrWhiteSpace(search) ? null : search,
            parsedStatus,
            sortKey,
            sortDirection,
            limit ?? 50,
            offset ?? 0
        );

        var records = await _repository.ListAsync(query, cancellationToken);
        var items = records.Select(ToResponse).ToList();

        return new EquipmentListResponse(items, query.Limit, query.Offset, items.Count);
    }

    public async Task<EquipmentResponse?> UpdateAsync(Guid id, EquipmentUpdateRequest request, CancellationToken cancellationToken)
    {
        var validation = Validate(request.AssetId, request.Type, request.InstalledDate, request.NextServiceDate, request.Status);
        if (validation is not null)
        {
            throw new InvalidOperationException(validation);
        }

        var record = await _repository.GetByIdAsync(id, cancellationToken);
        if (record is null)
        {
            return null;
        }

        var monitoringFlags = request.MonitoringFlags ?? new EquipmentMonitoringFlagsDto(false, false, false);
        var updated = record with
        {
            AssetId = request.AssetId.Trim(),
            Type = request.Type.Trim(),
            Location = NormalizeString(request.Location),
            Manufacturer = NormalizeString(request.Manufacturer),
            Model = NormalizeString(request.Model),
            InstalledDate = request.InstalledDate,
            Status = ParseStatusOrDefault(request.Status),
            NextServiceDate = request.NextServiceDate,
            MonitoringFlags = new EquipmentMonitoringFlags(
                monitoringFlags.TelemetryEnabled,
                monitoringFlags.MaintenanceAutoCreate,
                monitoringFlags.SafetyAlerts
            ),
            UpdatedAt = DateTimeOffset.UtcNow,
        };

        await _repository.UpdateAsync(updated, cancellationToken);
        return ToResponse(updated);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByIdAsync(id, cancellationToken);
        if (existing is null)
        {
            return false;
        }

        await _repository.DeleteAsync(id, cancellationToken);
        return true;
    }

    private static string? Validate(string assetId, string type, DateTime? installedDate, DateTime? nextServiceDate, string? status)
    {
        if (string.IsNullOrWhiteSpace(assetId))
        {
            return "AssetId is required.";
        }

        if (string.IsNullOrWhiteSpace(type))
        {
            return "Type is required.";
        }

        if (installedDate.HasValue && installedDate.Value.Date > DateTime.UtcNow.Date)
        {
            return "InstalledDate cannot be in the future.";
        }

        if (nextServiceDate.HasValue && installedDate.HasValue && nextServiceDate.Value.Date < installedDate.Value.Date)
        {
            return "NextServiceDate cannot be before InstalledDate.";
        }

        if (!string.IsNullOrWhiteSpace(status) && !Enum.TryParse<EquipmentStatus>(status, true, out _))
        {
            return $"Status '{status}' is invalid.";
        }

        return null;
    }

    private static EquipmentResponse ToResponse(EquipmentRecord record)
    {
        return new EquipmentResponse(
            record.Id,
            record.AssetId,
            record.Type,
            record.Location,
            record.Manufacturer,
            record.Model,
            record.InstalledDate,
            record.Status.ToString(),
            record.NextServiceDate,
            new EquipmentMonitoringFlagsDto(
                record.MonitoringFlags.TelemetryEnabled,
                record.MonitoringFlags.MaintenanceAutoCreate,
                record.MonitoringFlags.SafetyAlerts
            ),
            record.SpendYearToDate,
            record.CreatedAt,
            record.UpdatedAt
        );
    }

    private static EquipmentStatus ParseStatusOrDefault(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return EquipmentStatus.Unknown;
        }

        return Enum.TryParse<EquipmentStatus>(raw, true, out var parsed) ? parsed : EquipmentStatus.Unknown;
    }

    private static EquipmentStatus? ParseStatusFilter(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return null;
        }

        return Enum.TryParse<EquipmentStatus>(raw, true, out var parsed) ? parsed : null;
    }

    private static EquipmentSortKey ParseSortKey(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw) || !AllowedSortKeys.Contains(raw))
        {
            return EquipmentSortKey.SpendYearToDate;
        }

        return raw.Equals("nextService", StringComparison.OrdinalIgnoreCase)
            ? EquipmentSortKey.NextServiceDate
            : EquipmentSortKey.SpendYearToDate;
    }

    private static SortDirection ParseSortDirection(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw) || !AllowedDirections.Contains(raw))
        {
            return SortDirection.Asc;
        }

        return raw.Equals("desc", StringComparison.OrdinalIgnoreCase) ? SortDirection.Desc : SortDirection.Asc;
    }

    private static string? NormalizeString(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var trimmed = value.Trim();
        return trimmed.Length == 0 ? null : trimmed;
    }
}
