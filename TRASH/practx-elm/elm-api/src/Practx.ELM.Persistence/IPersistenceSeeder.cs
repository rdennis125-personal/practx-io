namespace Practx.ELM.Persistence;

public interface IPersistenceSeeder
{
    Task SeedAsync(CancellationToken cancellationToken);
}
