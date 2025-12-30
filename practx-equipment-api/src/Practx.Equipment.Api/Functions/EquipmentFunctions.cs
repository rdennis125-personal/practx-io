using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Practx.Equipment.Api.Dtos;
using Practx.Equipment.Api.Services;

namespace Practx.Equipment.Api.Functions;

public sealed class EquipmentFunctions
{
    private readonly IEquipmentService _service;
    private readonly JsonSerializerOptions _serializerOptions;

    public EquipmentFunctions(IEquipmentService service, JsonSerializerOptions serializerOptions)
    {
        _service = service;
        _serializerOptions = serializerOptions;
    }

    [Function("EquipmentList")]
    public async Task<HttpResponseData> ListAsync(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "equipment")] HttpRequestData req,
        CancellationToken cancellationToken)
    {
        var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        var response = await _service.ListAsync(
            query["search"],
            query["status"],
            query["sort"],
            query["direction"],
            ParseInt(query["limit"]),
            ParseInt(query["offset"]),
            cancellationToken);

        return await WriteJsonAsync(req, HttpStatusCode.OK, response, cancellationToken);
    }

    [Function("EquipmentGet")]
    public async Task<HttpResponseData> GetAsync(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "equipment/{id:guid}")] HttpRequestData req,
        Guid id,
        CancellationToken cancellationToken)
    {
        var response = await _service.GetAsync(id, cancellationToken);
        if (response is null)
        {
            return req.CreateResponse(HttpStatusCode.NotFound);
        }

        return await WriteJsonAsync(req, HttpStatusCode.OK, response, cancellationToken);
    }

    [Function("EquipmentCreate")]
    public async Task<HttpResponseData> CreateAsync(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "equipment")] HttpRequestData req,
        CancellationToken cancellationToken)
    {
        var request = await ReadJsonAsync<EquipmentCreateRequest>(req, cancellationToken);
        if (request is null)
        {
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }

        try
        {
            var response = await _service.CreateAsync(request, cancellationToken);
            return await WriteJsonAsync(req, HttpStatusCode.Created, response, cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            return await WriteErrorAsync(req, HttpStatusCode.BadRequest, ex.Message, cancellationToken);
        }
    }

    [Function("EquipmentUpdate")]
    public async Task<HttpResponseData> UpdateAsync(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "equipment/{id:guid}")] HttpRequestData req,
        Guid id,
        CancellationToken cancellationToken)
    {
        var request = await ReadJsonAsync<EquipmentUpdateRequest>(req, cancellationToken);
        if (request is null)
        {
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }

        try
        {
            var response = await _service.UpdateAsync(id, request, cancellationToken);
            if (response is null)
            {
                return req.CreateResponse(HttpStatusCode.NotFound);
            }

            return await WriteJsonAsync(req, HttpStatusCode.OK, response, cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            return await WriteErrorAsync(req, HttpStatusCode.BadRequest, ex.Message, cancellationToken);
        }
    }

    [Function("EquipmentDelete")]
    public async Task<HttpResponseData> DeleteAsync(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "equipment/{id:guid}")] HttpRequestData req,
        Guid id,
        CancellationToken cancellationToken)
    {
        var deleted = await _service.DeleteAsync(id, cancellationToken);
        return req.CreateResponse(deleted ? HttpStatusCode.NoContent : HttpStatusCode.NotFound);
    }

    private async Task<T?> ReadJsonAsync<T>(HttpRequestData req, CancellationToken cancellationToken)
    {
        try
        {
            return await JsonSerializer.DeserializeAsync<T>(req.Body, _serializerOptions, cancellationToken);
        }
        catch (JsonException)
        {
            return default;
        }
    }

    private async Task<HttpResponseData> WriteJsonAsync(HttpRequestData req, HttpStatusCode status, object payload, CancellationToken cancellationToken)
    {
        var response = req.CreateResponse(status);
        response.Headers.Add("Content-Type", "application/json");
        await JsonSerializer.SerializeAsync(response.Body, payload, _serializerOptions, cancellationToken);
        return response;
    }

    private Task<HttpResponseData> WriteErrorAsync(HttpRequestData req, HttpStatusCode status, string message, CancellationToken cancellationToken)
    {
        var payload = new { error = message };
        return WriteJsonAsync(req, status, payload, cancellationToken);
    }

    private static int? ParseInt(string? raw)
    {
        return int.TryParse(raw, out var value) ? value : null;
    }
}
