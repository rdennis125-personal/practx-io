# Infrastructure Variable Reference

This document catalogs every variable defined across the infrastructure Bicep templates and GitHub Actions workflows so that environment configuration remains transparent.

## GitHub Actions Workflows

### `.github/workflows/infra-storage.yml`

| Variable | Type | Scope | Description |
| --- | --- | --- | --- |
| `swa_csv` | workflow input | workflow_dispatch | Comma-separated list of Static Web App resource names that should have storage connection settings applied. |
| `RG` | environment variable | job | Target Azure resource group for storage deployments (derived from the `CICD_RG` repository variable). |
| `LOCATION` | environment variable | job | Azure region used when deploying storage resources (defaults to `westus2` when the `AZURE_LOCATION` repository variable is not set). |
| `SA_PREFIX` | environment variable | job | Base name applied to all storage accounts; suffixes (`-dev`, `-qa1`, production without suffix) are appended in the job. |

### `.github/workflows/infra-apim.yml`

| Variable | Type | Scope | Description |
| --- | --- | --- | --- |
| `RG` | environment variable | job | Resource group that receives the API Management deployment (sourced from the `CICD_RG` repository variable). |
| `LOCATION` | environment variable | job | Azure region for API Management resources (defaults to `westus2` when the `AZURE_LOCATION` repository variable is not set). |
| `NAME_PREFIX` | environment variable | job | Repository variable that seeds API Management resource names and is validated before deployment. |

### `.github/workflows/infra-sql.yml`

| Variable | Type | Scope | Description |
| --- | --- | --- | --- |
| `RG` | environment variable | job | Target Azure resource group for SQL deployments (derived from the `CICD_RG` repository variable). |
| `LOCATION` | environment variable | job | Azure region for the SQL logical server and database (defaults to `westus2` when the `AZURE_LOCATION` repository variable is not set). |
| `NAME_PREFIX` | environment variable | job | Repository variable used to derive the SQL server and database names; the workflow fails fast if it is empty. |
| `SQL_ADMIN_LOGIN` | environment variable | job | Administrator login pulled from the `SQL_ADMIN_LOGIN` repository secret. |
| `SQL_ADMIN_PASSWORD` | environment variable | job | Administrator password pulled from the `SQL_ADMIN_PASSWORD` repository secret. |

## Azure DevOps Pipelines

### `pipelines/practx-infra-azure-pipelines.yml`

| Variable | Type | Scope | Description |
| --- | --- | --- | --- |
| `AZURE_SERVICE_CONNECTION` | variable group | pipeline | Name of the Azure service connection with rights to deploy resources. |
| `AZ_RESOURCE_GROUP` | variable group | pipeline | Resource group targeted by the Bicep deployment. |
| `AZ_LOCATION` | pipeline variable | pipeline | Azure region for deployments; constrained to `westus2`. |
| `NAME_PREFIX` | variable group | pipeline | Prefix applied to provisioned resource names (e.g., `practx`). |
| `TENANT_ID` | variable group | pipeline | Azure AD tenant identifier, used for Key Vault access policies. |
| `FUNCTION_SKU` | pipeline variable | pipeline | Azure Functions plan SKU passed to the Bicep deployment (default `Y1`). |

## Bicep Templates

### `infra/modules/apim.bicep`

| Variable | Type | Description |
| --- | --- | --- |
| `location` | parameter | Resource group location for API Management. |
| `namePrefix` | parameter | Prefix used to derive API Management resource names (e.g., `practx-dev`). |
| `tags` | parameter | Optional tags applied to all API Management resources. |
| `publisherName` | parameter | Display name shown in the developer portal (defaults to `Practx.io`). |
| `publisherEmail` | parameter | Contact email surfaced in the developer portal (defaults to `support@practx.io`). |
| `skuName` | parameter | SKU tier for API Management (`Developer` only). |
| `skuCapacity` | parameter | Capacity of the chosen SKU (restricted to 1 for Developer). |
| `policyContent` | parameter | Raw XML applied at the global scope; defaults to the entitlement policy when omitted. |
| `createDefaultProduct` | parameter | Indicates whether the default Practx product should be provisioned. |
| `createDefaultApi` | parameter | Controls creation of a placeholder API that can be attached to downstream services. |
| `defaultApiDisplayName` | parameter | Display name for the placeholder API when `createDefaultApi` is true. |
| `defaultApiName` | parameter | Internal name for the placeholder API when `createDefaultApi` is true. |
| `defaultApiPath` | parameter | Public path segment exposed by the placeholder API when enabled. |
| `defaultApiServiceUrl` | parameter | Backend service URL proxied by the placeholder API when enabled. |

### `infra/modules/sql.bicep`

| Variable | Type | Description |
| --- | --- | --- |
| `namePrefix` | parameter | Prefix used to derive the SQL server and database names. |
| `location` | parameter | Azure region where the logical server and database are deployed. |
| `adminLogin` | parameter | Administrator login applied to the logical SQL server. |
| `adminPassword` | secure parameter | Administrator password for the SQL server. |
| `tags` | parameter | Optional tags applied to the SQL resources. |

### `infra/modules/storage.bicep`

| Variable | Type | Description |
| --- | --- | --- |
| `location` | parameter | Azure region for the storage account. |
| `storageAccountName` | parameter | Globally unique storage account name. |
| `containers` | parameter | List of blob containers to create (`landing`, `practice`, `patient`, `equipment`, `service` by default). |
| `tags` | parameter | Optional tags applied to the storage account. |
