# Practx Practice API

The Practx Practice API is a placeholder minimal API that establishes the scaffolding for practice
management capabilities. It follows the shared conventions for diagnostics, OpenAPI generation, and
infrastructure provisioning.

## Structure

- `src/Practx.Practice.Api/` – ASP.NET Core minimal API.
- `tests/Practx.Practice.Api.Tests/` – Integration tests validating `/healthz`.
- `OpenAPI/openapi.yaml` – Contract exported via CI.

## Environment configuration

| Setting | Description |
| --- | --- |
| `ASPNETCORE_ENVIRONMENT` | Deployment environment (`Development`, `Qa`, `Production`). |
| `PRACTX_APIM_BASE_URL` | Base URL for downstream services via APIM. |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Key Vault reference to the Application Insights instance. |
| `APPINSIGHTS_INSTRUMENTATIONKEY` | Legacy instrumentation key support. |

## Deployment inputs

See `infra/modules/practice-api/api.bicep` for the required parameters (`appName`, `env`, `location`, `kvName`).
