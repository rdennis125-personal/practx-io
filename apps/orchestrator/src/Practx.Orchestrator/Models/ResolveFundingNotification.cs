using System.Text.Json.Serialization;

namespace Practx.Orchestrator.Models;

public record ResolveFundingNotification
{
    [JsonPropertyName("order_id")]
    public string OrderId { get; init; } = string.Empty;

    [JsonPropertyName("approved")]
    public bool Approved { get; init; } = true;
}
