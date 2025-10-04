using System.Security.Cryptography;
using System.Text;

namespace Practx.Orchestrator.Services;

public class AckTokenService : IAckTokenService
{
    private const int NonceLength = 8;

    public string CreateToken(string orderId)
    {
        var nonce = RandomNumberGenerator.GetBytes(NonceLength);
        var payload = Encoding.UTF8.GetBytes(orderId);
        var combined = nonce.Concat(payload).ToArray();
        return Convert.ToBase64String(combined);
    }

    public bool TryValidate(string token, out string? orderId)
    {
        orderId = null;
        try
        {
            var data = Convert.FromBase64String(token);
            if (data.Length <= NonceLength)
            {
                return false;
            }

            var orderBytes = data[NonceLength..];
            orderId = Encoding.UTF8.GetString(orderBytes);
            return !string.IsNullOrWhiteSpace(orderId);
        }
        catch
        {
            return false;
        }
    }
}
