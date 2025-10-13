# Practx Patients API

The Practx Patients API provides the baseline hosting, diagnostics, and contract scaffolding for future
patient engagement features.

## Structure

- `src/Practx.Patients.Api/` – Minimal API host.
- `tests/Practx.Patients.Api.Tests/` – Integration tests.
- `OpenAPI/openapi.yaml` – Generated contract.

## Environment configuration

| Setting | Description |
| --- | --- |
| `ASPNETCORE_ENVIRONMENT` | Deployment environment (`Development`, `Qa`, `Production`). |
| `PRACTX_APIM_BASE_URL` | Base URL for dependent services via APIM. |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Key Vault reference to Application Insights. |
| `APPINSIGHTS_INSTRUMENTATIONKEY` | Legacy instrumentation key support. |

## Deployment inputs

See `infra/modules/patients-api/api.bicep` for required parameters.
