using System.Text;
using Azure.Storage.Files.DataLake;
using Dapper;
using Microsoft.Extensions.Logging;

namespace StripeWebhook;

public class EventRepository
{
    private readonly SqlConnectionFactory _factory;
    private readonly DataLakeServiceClient? _dataLake;
    private readonly ILogger<EventRepository> _logger;

    public EventRepository(SqlConnectionFactory factory, DataLakeServiceClient? dataLake, ILogger<EventRepository> logger)
    {
        _factory = factory;
        _dataLake = dataLake;
        _logger = logger;
    }

    public async Task<bool> StoreAsync(string eventId, string eventType, Guid? orgId, string payloadJson)
    {
        await using var conn = await _factory.OpenAsync();
        var inserted = await conn.ExecuteAsync(@"if not exists(select 1 from SUBSCRIPTION_EVENTS where EVENT_ID = @eventId)
                                                  insert into SUBSCRIPTION_EVENTS(EVENT_ID, EVENT_TYPE, ORG_ID, PAYLOAD_JSON)
                                                  values(@eventId, @eventType, @orgId, @payloadJson)",
            new { eventId, eventType, orgId, payloadJson });

        if (inserted > 0)
        {
            await WriteToStorageAsync(eventId, payloadJson);
        }

        return inserted > 0;
    }

    private async Task WriteToStorageAsync(string eventId, string payloadJson)
    {
        if (_dataLake is null)
        {
            _logger.LogInformation("Data lake connection not configured; skipping blob archive for event {EventId}", eventId);
            return;
        }

        var fileSystem = _dataLake.GetFileSystemClient("Practx");
        await fileSystem.CreateIfNotExistsAsync();

        var now = DateTime.UtcNow;
        var directoryPath = $"stripe/events/{now:yyyy}/{now:MM}/{now:dd}";
        var directory = fileSystem.GetDirectoryClient(directoryPath);
        await directory.CreateIfNotExistsAsync();

        var file = directory.GetFileClient($"{eventId}.json");
        await using var stream = new MemoryStream(Encoding.UTF8.GetBytes(payloadJson));
        await file.UploadAsync(stream, overwrite: true);
    }
}
