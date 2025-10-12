namespace Practx.ELM.Domain.Entities;

public class Provider
{
    public Provider(Guid providerId, string name)
    {
        ProviderId = providerId;
        Name = name;
    }

    public Guid ProviderId { get; }

    public string Name { get; }
}
