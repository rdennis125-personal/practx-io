using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Options;

namespace Practx.Equipment.Api.Data;

public sealed class EquipmentDatabase
{
    private readonly EquipmentDatabaseOptions _options;

    public EquipmentDatabase(IOptions<EquipmentDatabaseOptions> options)
    {
        _options = options.Value;
    }

    public SqliteConnection CreateConnection()
    {
        return new SqliteConnection(_options.ConnectionString);
    }
}
