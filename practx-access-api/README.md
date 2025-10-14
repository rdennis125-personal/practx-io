# Practx Access API

The Practx Access API owns identity and access control surfaces. This placeholder project ensures the
CI/CD, infrastructure, and contracts model is in place before feature delivery begins.

## Structure

- `src/Practx.Access.Api/`
- `tests/Practx.Access.Api.Tests/`
- `OpenAPI/openapi.yaml`

## Environment configuration

| Setting | Description |
| --- | --- |
| `ASPNETCORE_ENVIRONMENT` | Deployment environment (`Development`, `Qa`, `Production`). |
| `APIM_BASE_URL` | Base URL for APIM downstream calls. |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Key Vault reference to Application Insights. |
| `APPINSIGHTS_INSTRUMENTATIONKEY` | Legacy instrumentation key support. |

## Deployment inputs

See `infra/modules/access-api/api.bicep` for required parameters.
