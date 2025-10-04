namespace Practx.Orchestrator.Services;

public interface IAckTokenService
{
    string CreateToken(string orderId);
    bool TryValidate(string token, out string? orderId);
}
