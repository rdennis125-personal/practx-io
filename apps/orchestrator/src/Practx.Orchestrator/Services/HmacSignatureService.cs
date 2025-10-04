using System.Security.Cryptography;
using System.Text;

namespace Practx.Orchestrator.Services;

public class HmacSignatureService : ISignatureService
{
    public string CreateSignature(string body, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(body));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public bool IsValid(string? providedSignature, string body, string secret)
    {
        if (string.IsNullOrWhiteSpace(providedSignature))
        {
            return false;
        }

        var calculated = CreateSignature(body, secret);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(calculated),
            Encoding.UTF8.GetBytes(providedSignature));
    }
}
