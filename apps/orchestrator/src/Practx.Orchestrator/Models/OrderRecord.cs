using System.Text.Json.Serialization;

namespace Practx.Orchestrator.Models;

public record OrderRecord
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

    public OrderStatus Status { get; set; } = OrderStatus.Created;

    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;

    public DateTimeOffset? DealerRequestAt { get; set; }

    public DateTimeOffset? DealerAcknowledgedAt { get; set; }

    public DateTimeOffset? ResolveInvoiceAt { get; set; }

    public DateTimeOffset? ResolveFundedAt { get; set; }

    public DateTimeOffset? HeldTransferCreatedAt { get; set; }

    public DateTimeOffset? ReleasedAt { get; set; }

    public string? AcknowledgementToken { get; set; }

    public string? IdempotencyKey { get; set; }

    public string? Notes { get; set; }
}
