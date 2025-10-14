# Practx Service API

The Practx Service API establishes the baseline runtime footprint for future support and field service
integrations.

## Structure

- `src/Practx.Service.Api/`
- `tests/Practx.Service.Api.Tests/`
- `OpenAPI/openapi.yaml`

## Environment configuration

| Setting | Description |
| --- | --- |
| `ASPNETCORE_ENVIRONMENT` | Deployment environment (`Development`, `Qa`, `Production`). |
| `APIM_BASE_URL` | Downstream APIM base URL. |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Key Vault reference for telemetry. |
| `APPINSIGHTS_INSTRUMENTATIONKEY` | Legacy instrumentation key support. |

## Deployment inputs

See `infra/modules/service-api/api.bicep` for required parameters.
