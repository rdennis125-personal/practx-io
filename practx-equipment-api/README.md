# Practx Equipment API

The Practx Equipment API delivers equipment lifecycle capabilities for the platform. This project was
renamed from the historical ELM service and continues to expose diagnostics endpoints while the remaining
domain features are built out.

## Structure

- `src/Practx.Equipment.Api/` – ASP.NET Core minimal API (net8.0).
- `tests/Practx.Equipment.Api.Tests/` – xUnit integration tests.
- `OpenAPI/openapi.yaml` – contract exported from CI.
- `scripts/` – operational tooling (smoke tests).

## Local development

```bash
cd practx-equipment-api/src/Practx.Equipment.Api
dotnet restore
dotnet run
```

Available endpoints:

- `GET /healthz`
- `GET /version`

## Quality checks

From the repository root (`practx-equipment-api/`):

```bash
npm run lint:openapi     # Validate the OpenAPI contract with Spectral
dotnet test tests/Practx.Equipment.Api.Tests/Practx.Equipment.Api.Tests.csproj -c Release
```

## Deployment

### Required GitHub variables and secrets

| Name | Location | Description |
| --- | --- | --- |
| `AZURE_SUBSCRIPTION_ID` | Repository variable | Subscription that hosts the App Service. |
| `AZURE_TENANT_ID` | Repository variable | Azure AD tenant for the federated credential. |
| `AZ_RG` | Repository variable | Resource group containing the App Service (e.g., `rg-practx-dev`). |
| `SERVICE_NAME` | Repository variable | App Service name (e.g., `app-equipment-dev`). |
| `ENV_NAME` | Repository variable | Deployment environment moniker (e.g., `dev`). |
| `APIM_NAME` | Repository variable (optional) | API Management instance to update with the OpenAPI contract. |
| `AZURE_CLIENT_ID` | Repository secret | Service principal / managed identity client ID configured for OIDC. |

### Workflow

Deployment is automated by `.github/workflows/deploy-equipment-api.yml`:

1. Restores dependencies, builds, runs tests, and publishes the API.
2. Lints the OpenAPI contract using Spectral.
3. Uploads a zip package artifact.
4. Deploys the artifact to the configured App Service using azure/webapps-deploy.
5. Optionally updates API Management when `APIM_NAME` is set.
6. Runs `scripts/smoke.sh` to verify `/healthz` returns `200`.

### Smoke test

```bash
./scripts/smoke.sh https://<app-name>.azurewebsites.net
```

The script retries transient failures and exits non-zero if the health probe is not healthy.

## Environment configuration

| Setting | Description |
| --- | --- |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Injected via Key Vault reference in production. |
| `APPINSIGHTS_INSTRUMENTATIONKEY` | Legacy instrumentation key support. |
| `ASPNETCORE_ENVIRONMENT` | Deployment environment (`Development`, `Qa`, `Production`). |
| `APIM_BASE_URL` | Base URL for downstream API Management calls. |

A default `appsettings.json` is included with ASP.NET Core logging defaults. Override via environment
variables or slot settings in Azure App Service.

## Observability

Log streaming and historical traces are available through Azure App Service diagnostics and Application
Insights (when the instrumentation key/connection string is provided). GitHub Actions job summaries capture
the deployed hostname for quick access to logs.
