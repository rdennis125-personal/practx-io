namespace Practx.Orchestrator.Models;

public record ResolveInvoiceResult(string OrderId, string InvoiceId, bool RequiresManualReview);
