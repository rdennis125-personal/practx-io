# Practx Variable Catalog

This catalog standardizes variable names across the Practx solution with the Azure Static Web App (`practx-swa`) as the source of truth. Each entry documents the purpose, storage location, and the modules or automations that consume the variable.

## Azure application settings

| Name | Purpose | Type | Location | Consumers |
| --- | --- | --- | --- | --- |
| `APIM_BASE_URL` | Base URL for routing requests through Azure API Management. | App setting (environment variable) | Azure Static Web Apps environment variables; Azure App Service application settings | `practx-swa` (`routes.json`, environment configs), all API app services via Bicep modules |
| `PRACTX_WEBJOB_STORAGE` | Storage connection string used by the Static Web App Functions API. | App setting (environment variable) | Azure Static Web Apps environment variables | `practx-swa` Functions (`api/Signup`, `api/HelloWorld`) |
| `AZURE_STORAGE_CONNECTION_STRING` | Legacy alias for the storage connection string fallback. | App setting (environment variable) | Azure Static Web Apps environment variables | `practx-swa` Functions (`api/Signup`, `api/HelloWorld`) |
| `STORAGE_TABLE_NAME` | Azure Table name for storing marketing leads. | App setting (environment variable) | Azure Static Web Apps environment variables | `practx-swa` Function (`api/Signup`) |
| `PRACTX_BLOB_CONTAINER_LANDING` | Blob container for general landing content. | App setting (environment variable) | Azure Static Web Apps environment variables | `practx-swa` Functions (`api/HelloWorld`) |
| `PRACTX_BLOB_CONTAINER_PRACTICE` | Blob container override for practice-specific blobs. | App setting (environment variable) | Azure Static Web Apps environment variables | `practx-swa` Functions (`api/HelloWorld`) |
| `PRACTX_BLOB_CONTAINER_PATIENT` | Blob container override for patient-specific blobs. | App setting (environment variable) | Azure Static Web Apps environment variables | `practx-swa` Functions (`api/HelloWorld`) |
| `PRACTX_BLOB_CONTAINER_EQUIPMENT` | Blob container override for equipment-specific blobs. | App setting (environment variable) | Azure Static Web Apps environment variables | `practx-swa` Functions (`api/HelloWorld`) |
| `PRACTX_BLOB_CONTAINER_SERVICE` | Blob container override for service-specific blobs. | App setting (environment variable) | Azure Static Web Apps environment variables | `practx-swa` Functions (`api/HelloWorld`) |
| `ALLOWED_ORIGIN` | Optional comma-separated allowlist for CORS responses. | App setting (environment variable) | Azure Static Web Apps environment variables | `practx-swa` Function (`api/Signup`) |
| `ASPNETCORE_ENVIRONMENT` | Sets the ASP.NET Core hosting environment (`Development`, `Qa`, `Production`). | App setting (environment variable) | Azure App Service application settings | All .NET APIs provisioned by the `infra/modules/*-api/api.bicep` modules |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Connection string for forwarding telemetry to Application Insights. | App setting (environment variable) | Azure App Service application settings | All .NET APIs provisioned by the `infra/modules/*-api/api.bicep` modules |
| `APPINSIGHTS_INSTRUMENTATIONKEY` | Legacy instrumentation key for backward-compatible telemetry ingestion. | App setting (environment variable) | Azure App Service application settings | All .NET APIs provisioned by the `infra/modules/*-api/api.bicep` modules |

## Azure Key Vault secrets

| Name | Purpose | Location | Consumers |
| --- | --- | --- | --- |
| `APIM-BASE-URL-<env>` | Stores the canonical API Management base URL per environment. | Azure Key Vault | Referenced by `infra/modules/*-api/api.bicep` to inject `APIM_BASE_URL` |
| `APPINSIGHTS-CONNECTION-STRING-<env>` | Stores the Application Insights connection string per environment. | Azure Key Vault | Referenced by `infra/modules/*-api/api.bicep` to inject telemetry settings |

## GitHub repository secrets

| Name | Purpose | Location | Consumers |
| --- | --- | --- | --- |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_MANGO_HILL_0CB59961E` | Deployment token for the production Static Web App. | GitHub repository secret | `.github/workflows/azure-static-web-apps.yml` |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_MANGO_MOSS_04BC3691E` | Deployment token for preview Static Web App slots. | GitHub repository secret | `.github/workflows/azure-static-web-apps-mango-moss-04bc3691e.yml` |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_DELIGHTFUL_GROUND_06C5F621E` | Deployment token for the secondary Static Web App environment. | GitHub repository secret | `.github/workflows/azure-static-web-apps-delightful-ground-06c5f621e.yml` |
| `AZURE_CLIENT_ID` | Service principal client ID for DevCenter catalog sync. | GitHub repository secret | `.github/workflows/devcenter-catalog-sync.yml` |
| `CICD_CLIENT_ID` | Service principal client ID used by infrastructure deployments. | GitHub repository secret | `.github/workflows/infra-*.yml` |
| `SQL_ADMIN_LOGIN` | Administrator login used when provisioning SQL databases. | GitHub repository secret | `.github/workflows/infra-sql.yml` |
| `SQL_ADMIN_PASSWORD` | Administrator password paired with `SQL_ADMIN_LOGIN`. | GitHub repository secret | `.github/workflows/infra-sql.yml` |

## GitHub repository variables

| Name | Purpose | Location | Consumers |
| --- | --- | --- | --- |
| `AZURE_TENANT_ID` | Azure AD tenant ID for OIDC logins. | GitHub repository variable | `.github/workflows/devcenter-catalog-sync.yml`, `.github/workflows/infra-*.yml` |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID targeted by infrastructure deployments. | GitHub repository variable | `.github/workflows/devcenter-catalog-sync.yml`, `.github/workflows/infra-*.yml` |
| `CICD_RG` | Resource group name used for shared infrastructure deployments. | GitHub repository variable | `.github/workflows/infra-*.yml` |
| `AZURE_LOCATION` | Default Azure region for infrastructure workflows. | GitHub repository variable | `.github/workflows/infra-apim.yml`, `.github/workflows/infra-sql.yml` |
| `NAME_PREFIX` | Prefix applied to resource naming conventions. | GitHub repository variable | `.github/workflows/infra-apim.yml`, `.github/workflows/infra-sql.yml` |
| `AZURE_DEV_CENTER_RG` | Resource group containing the DevCenter instance. | GitHub repository variable | `.github/workflows/devcenter-catalog-sync.yml` |
| `AZURE_DEVCENTER` | Azure DevCenter name used during catalog sync. | GitHub repository variable | `.github/workflows/devcenter-catalog-sync.yml` |
| `AZURE_CATALOG` | DevCenter catalog name targeted by sync automation. | GitHub repository variable | `.github/workflows/devcenter-catalog-sync.yml` |

## Derived local development settings

These values are not stored in GitHub or Azure but are commonly used for local development following the Static Web App template:

| Name | Purpose | Consumers |
| --- | --- | --- |
| `FUNCTIONS_WORKER_RUNTIME` | Ensures the local Azure Functions host runs with the Node.js runtime. | `practx-swa` local development (`local.settings.json` template) |

