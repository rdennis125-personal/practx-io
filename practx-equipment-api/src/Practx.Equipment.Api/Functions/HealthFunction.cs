using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace Practx.Equipment.Api.Functions;

public class HealthFunction
{
    [Function("HealthCheck")]
    public static HttpResponseData Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "healthz")] HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "application/json");
        response.WriteString(DiagnosticsPayloads.HealthJson());
        return response;
    }
}
