using Microsoft.Data.Sqlite;
using Practx.Equipment.Api.Models;

namespace Practx.Equipment.Api.Data;

public sealed class SqliteEquipmentRepository : IEquipmentRepository
{
    private readonly EquipmentDatabase _database;

    public SqliteEquipmentRepository(EquipmentDatabase database)
    {
        _database = database;
    }

    public async Task<EquipmentRecord?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT id, asset_id, type, location, manufacturer, model, installed_date, status, next_service_date,
                   monitoring_telemetry, monitoring_maintenance, monitoring_safety, spend_ytd, created_at, updated_at
            FROM equipment
            WHERE id = $id
            LIMIT 1;
            """;

        await using var connection = _database.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.AddWithValue("$id", id.ToString());
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    public async Task<EquipmentRecord?> GetByAssetIdAsync(string assetId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT id, asset_id, type, location, manufacturer, model, installed_date, status, next_service_date,
                   monitoring_telemetry, monitoring_maintenance, monitoring_safety, spend_ytd, created_at, updated_at
            FROM equipment
            WHERE asset_id = $assetId
            LIMIT 1;
            """;

        await using var connection = _database.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.AddWithValue("$assetId", assetId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    public async Task<IReadOnlyList<EquipmentRecord>> ListAsync(EquipmentQuery query, CancellationToken cancellationToken)
    {
        var conditions = new List<string>();
        var orderBy = query.SortKey == EquipmentSortKey.NextServiceDate ? "next_service_date" : "spend_ytd";
        var direction = query.SortDirection == SortDirection.Desc ? "DESC" : "ASC";
        var limit = Math.Clamp(query.Limit, 1, 200);
        var offset = Math.Max(query.Offset, 0);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            conditions.Add("(LOWER(asset_id) LIKE $search OR LOWER(type) LIKE $search OR LOWER(location) LIKE $search)");
        }

        if (query.Status.HasValue)
        {
            conditions.Add("status = $status");
        }

        var whereClause = conditions.Count > 0 ? $"WHERE {string.Join(" AND ", conditions)}" : string.Empty;

        var sql = $"""
            SELECT id, asset_id, type, location, manufacturer, model, installed_date, status, next_service_date,
                   monitoring_telemetry, monitoring_maintenance, monitoring_safety, spend_ytd, created_at, updated_at
            FROM equipment
            {whereClause}
            ORDER BY {orderBy} {direction}
            LIMIT $limit OFFSET $offset;
            """;

        var results = new List<EquipmentRecord>();
        await using var connection = _database.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.AddWithValue("$limit", limit);
        command.Parameters.AddWithValue("$offset", offset);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            command.Parameters.AddWithValue("$search", $"%{query.Search.Trim().ToLowerInvariant()}%");
        }

        if (query.Status.HasValue)
        {
            command.Parameters.AddWithValue("$status", query.Status.Value.ToString());
        }

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            results.Add(Map(reader));
        }

        return results;
    }

    public async Task<EquipmentRecord> CreateAsync(EquipmentRecord record, CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO equipment (
                id, asset_id, type, location, manufacturer, model, installed_date, status, next_service_date,
                monitoring_telemetry, monitoring_maintenance, monitoring_safety, spend_ytd, created_at, updated_at
            ) VALUES (
                $id, $assetId, $type, $location, $manufacturer, $model, $installedDate, $status, $nextServiceDate,
                $monitoringTelemetry, $monitoringMaintenance, $monitoringSafety, $spendYtd, $createdAt, $updatedAt
            );
            """;

        await using var connection = _database.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        BindParameters(command, record);
        await command.ExecuteNonQueryAsync(cancellationToken);
        return record;
    }

    public async Task<EquipmentRecord> UpdateAsync(EquipmentRecord record, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE equipment
            SET asset_id = $assetId,
                type = $type,
                location = $location,
                manufacturer = $manufacturer,
                model = $model,
                installed_date = $installedDate,
                status = $status,
                next_service_date = $nextServiceDate,
                monitoring_telemetry = $monitoringTelemetry,
                monitoring_maintenance = $monitoringMaintenance,
                monitoring_safety = $monitoringSafety,
                spend_ytd = $spendYtd,
                updated_at = $updatedAt
            WHERE id = $id;
            """;

        await using var connection = _database.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        BindParameters(command, record);
        await command.ExecuteNonQueryAsync(cancellationToken);
        return record;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        const string sql = "DELETE FROM equipment WHERE id = $id;";
        await using var connection = _database.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.AddWithValue("$id", id.ToString());
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static void BindParameters(SqliteCommand command, EquipmentRecord record)
    {
        command.Parameters.AddWithValue("$id", record.Id.ToString());
        command.Parameters.AddWithValue("$assetId", record.AssetId);
        command.Parameters.AddWithValue("$type", record.Type);
        command.Parameters.AddWithValue("$location", record.Location ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("$manufacturer", record.Manufacturer ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("$model", record.Model ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("$installedDate", record.InstalledDate?.ToString("yyyy-MM-dd"));
        command.Parameters.AddWithValue("$status", record.Status.ToString());
        command.Parameters.AddWithValue("$nextServiceDate", record.NextServiceDate?.ToString("yyyy-MM-dd"));
        command.Parameters.AddWithValue("$monitoringTelemetry", record.MonitoringFlags.TelemetryEnabled ? 1 : 0);
        command.Parameters.AddWithValue("$monitoringMaintenance", record.MonitoringFlags.MaintenanceAutoCreate ? 1 : 0);
        command.Parameters.AddWithValue("$monitoringSafety", record.MonitoringFlags.SafetyAlerts ? 1 : 0);
        command.Parameters.AddWithValue("$spendYtd", record.SpendYearToDate);
        command.Parameters.AddWithValue("$createdAt", record.CreatedAt.ToString("O"));
        command.Parameters.AddWithValue("$updatedAt", record.UpdatedAt.ToString("O"));
    }

    private static EquipmentRecord Map(SqliteDataReader reader)
    {
        var installedDate = reader["installed_date"] as string;
        var nextServiceDate = reader["next_service_date"] as string;
        var createdAt = reader["created_at"] as string;
        var updatedAt = reader["updated_at"] as string;

        return new EquipmentRecord
        {
            Id = Guid.Parse(reader["id"].ToString() ?? string.Empty),
            AssetId = reader["asset_id"].ToString() ?? string.Empty,
            Type = reader["type"].ToString() ?? string.Empty,
            Location = reader["location"] as string,
            Manufacturer = reader["manufacturer"] as string,
            Model = reader["model"] as string,
            InstalledDate = ParseDate(installedDate),
            Status = Enum.TryParse<EquipmentStatus>(reader["status"].ToString(), out var status)
                ? status
                : EquipmentStatus.Unknown,
            NextServiceDate = ParseDate(nextServiceDate),
            MonitoringFlags = new EquipmentMonitoringFlags(
                Convert.ToInt32(reader["monitoring_telemetry"]) == 1,
                Convert.ToInt32(reader["monitoring_maintenance"]) == 1,
                Convert.ToInt32(reader["monitoring_safety"]) == 1
            ),
            SpendYearToDate = reader["spend_ytd"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["spend_ytd"]),
            CreatedAt = DateTimeOffset.Parse(createdAt ?? DateTimeOffset.UtcNow.ToString("O")),
            UpdatedAt = DateTimeOffset.Parse(updatedAt ?? DateTimeOffset.UtcNow.ToString("O")),
        };
    }

    private static DateTime? ParseDate(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return null;
        }

        return DateTime.TryParse(raw, out var value) ? value : null;
    }
}
