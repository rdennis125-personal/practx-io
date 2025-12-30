using System.Text;
using Microsoft.Extensions.Hosting;

namespace Practx.Equipment.Api.Data;

public sealed class EquipmentMigrationHostedService : IHostedService
{
    private readonly EquipmentDatabase _database;

    public EquipmentMigrationHostedService(EquipmentDatabase database)
    {
        _database = database;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var migrationPath = Path.Combine(AppContext.BaseDirectory, "Migrations", "001_create_equipment.sql");
        if (!File.Exists(migrationPath))
        {
            return;
        }

        var sql = await File.ReadAllTextAsync(migrationPath, Encoding.UTF8, cancellationToken);
        if (string.IsNullOrWhiteSpace(sql))
        {
            return;
        }

        await using var connection = _database.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
