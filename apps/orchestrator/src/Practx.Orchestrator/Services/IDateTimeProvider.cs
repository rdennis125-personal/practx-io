namespace Practx.Orchestrator.Services;

public interface IDateTimeProvider
{
    DateTimeOffset UtcNow { get; }
}
