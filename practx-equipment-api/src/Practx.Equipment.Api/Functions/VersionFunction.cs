using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace Practx.Equipment.Api.Functions;

public class VersionFunction
{
    [Function("Version")]
    public static HttpResponseData Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "version")] HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "application/json");
        response.WriteString(DiagnosticsPayloads.VersionJson());
        return response;
    }
}
