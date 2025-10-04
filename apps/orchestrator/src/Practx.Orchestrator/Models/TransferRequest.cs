using System.Text.Json.Serialization;

namespace Practx.Orchestrator.Models;

public record TransferRequest
{
    [JsonPropertyName("order_id")]
    public string OrderId { get; init; } = string.Empty;

    [JsonPropertyName("reason")]
    public string Reason { get; init; } = string.Empty;
}
