# Practx Equipment API

The Practx Equipment API delivers equipment lifecycle capabilities for the platform. This project was
renamed from the historical ELM service and continues to expose diagnostics endpoints while we build out
the remaining domain features.

## Structure

- `src/Practx.Equipment.Api/` – ASP.NET Core minimal API.
- `tests/Practx.Equipment.Api.Tests/` – xUnit integration tests.
- `OpenAPI/openapi.yaml` – contract exported from CI.

## Local development

```bash
cd practx-equipment-api/src/Practx.Equipment.Api
dotnet restore
dotnet run
```

Available endpoints:

- `GET /healthz`
- `GET /version`

## Environment configuration

| Setting | Description |
| --- | --- |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Injected via Key Vault reference in production. |
| `APPINSIGHTS_INSTRUMENTATIONKEY` | Legacy instrumentation key support. |
| `ASPNETCORE_ENVIRONMENT` | Deployment environment (`Development`, `Qa`, `Production`). |
| `PRACTX_APIM_BASE_URL` | Base URL for downstream API Management calls. |

## Deployment inputs

The `infra/modules/equipment-api/api.bicep` module expects:

- `appName` – Name of the App Service resource.
- `env` – Short environment moniker (e.g., `dev`, `qa`, `prod`).
- `location` – Azure region; defaults to the resource group location.
- `kvName` – Name of the Key Vault that stores application settings.

CI/CD is orchestrated through `github/workflows/build-equipment-api.yml` and
`github/workflows/deploy-equipment-api.yml`.
