namespace Practx.ELM.Persistence.Blob;

internal sealed class BlobPersistenceSeeder : IPersistenceSeeder
{
    private readonly BlobDataStore _store;

    public BlobPersistenceSeeder(BlobDataStore store)
    {
        _store = store;
    }

    public Task SeedAsync(CancellationToken cancellationToken)
    {
        _store.EnsureSeeded();
        return Task.CompletedTask;
    }
}
