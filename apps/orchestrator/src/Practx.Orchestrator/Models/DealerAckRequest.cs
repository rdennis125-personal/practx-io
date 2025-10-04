using System.Text.Json.Serialization;

namespace Practx.Orchestrator.Models;

public record DealerAckRequest
{
    [JsonPropertyName("token")]
    public string Token { get; init; } = string.Empty;

    [JsonPropertyName("approved")]
    public bool Approved { get; init; }

    [JsonPropertyName("actor")]
    public string Actor { get; init; } = "Dealer Desk";
}
