using System.Text.Json.Serialization;

namespace Practx.Orchestrator.Models;

public record OrderCreateRequest
{
    [JsonPropertyName("order_id")]
    public string OrderId { get; init; } = string.Empty;

    [JsonPropertyName("customer_id")]
    public string CustomerId { get; init; } = string.Empty;

    [JsonPropertyName("amount_cents")]
    public int AmountCents { get; init; }

    [JsonPropertyName("currency")]
    public string Currency { get; init; } = "usd";

    [JsonPropertyName("payment_method")]
    public PaymentMethod PaymentMethod { get; init; }

    [JsonPropertyName("dealer_name")]
    public string? DealerName { get; init; }

    [JsonPropertyName("ap_contact_email")]
    public string? ApContactEmail { get; init; }

    [JsonPropertyName("notes")]
    public string? Notes { get; init; }
}
