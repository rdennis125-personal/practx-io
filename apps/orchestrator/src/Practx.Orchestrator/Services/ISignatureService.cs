namespace Practx.Orchestrator.Services;

public interface ISignatureService
{
    string CreateSignature(string body, string secret);
    bool IsValid(string? providedSignature, string body, string secret);
}
