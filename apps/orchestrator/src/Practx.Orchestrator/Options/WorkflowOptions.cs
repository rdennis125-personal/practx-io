namespace Practx.Orchestrator.Options;

public class WorkflowOptions
{
    public string StripeTestKey { get; set; } = string.Empty;
    public string ResolveTestKey { get; set; } = string.Empty;
    public string ServiceBusConnection { get; set; } = string.Empty;
    public int AutoReleaseDays { get; set; } = 7;
    public int DealerTimeoutMinutes { get; set; } = 30;
    public string AckUrlBase { get; set; } = string.Empty;
    public string WebhookHmacSecret { get; set; } = string.Empty;
    public int MockDealerDelaySeconds { get; set; } = 5;
}
