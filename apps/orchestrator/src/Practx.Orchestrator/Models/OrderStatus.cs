namespace Practx.Orchestrator.Models;

public enum OrderStatus
{
    Created,
    DealerRequested,
    DealerAcknowledged,
    DealerDeclined,
    ResolveInvoiceCreated,
    ResolveFunded,
    HeldTransferCreated,
    AwaitingAcknowledgement,
    Released,
    Disputed
}
