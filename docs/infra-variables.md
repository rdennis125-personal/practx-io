# Infrastructure Variable Reference

This document catalogs every variable defined across the infrastructure Bicep templates and YAML pipelines so that environment configuration remains transparent.

## GitHub Actions Workflows

### `.github/workflows/infra-storage.yml`

| Variable | Type | Scope | Description |
| --- | --- | --- | --- |
| `swa_csv` | workflow input | workflow_dispatch | Comma-separated list of Static Web App resource names that should have storage connection settings applied. |
| `RG` | environment variable | job | Target Azure resource group for storage deployments. |
| `LOCATION` | environment variable | job | Azure region used when deploying storage resources. |
| `SA_PREFIX` | environment variable | job | Base name applied to all storage accounts; suffixes (`-dev`, `-qa1`, production without suffix) are appended in the job. |

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

### `infra/bicep/main.bicep`

| Variable | Type | Description |
| --- | --- | --- |
| `namePrefix` | parameter | Prefix used when constructing resource names (e.g., `practx-dev`). |
| `location` | parameter | Azure region for all child modules (defaults to `westus2`). |
| `tags` | parameter | Optional tags applied to each module's resources. |
| `functionSku` | parameter | Functions hosting plan SKU (defaults to `Y1`). |
| `tenantId` | parameter | Azure AD tenant ID injected into the Key Vault module for access policies. |

### `infra/bicep/modules/appInsights.bicep`

| Variable | Type | Description |
| --- | --- | --- |
| `name` | parameter | Name assigned to the Application Insights resource. |
| `location` | parameter | Azure region for Application Insights. |
| `tags` | parameter | Optional tags applied to the Application Insights component. |

### `infra/bicep/modules/serviceBus.bicep`

| Variable | Type | Description |
| --- | --- | --- |
| `name` | parameter | Name of the Service Bus namespace. |
| `location` | parameter | Azure region for the Service Bus namespace. |
| `tags` | parameter | Optional tags applied to the namespace. |
| `subscriptions` | variable | Array of subscription names created for the `payments` topic (`dealer`, `resolve`, `settlements`). |

### `infra/bicep/modules/functionApp.bicep`

| Variable | Type | Description |
| --- | --- | --- |
| `name` | parameter | Name of the Function App resource. |
| `location` | parameter | Azure region for the Function App and related resources. |
| `tags` | parameter | Optional tags applied to the Function App, plan, and storage account. |
| `planSku` | parameter | Hosting plan SKU (defaults to `Y1`). |
| `appInsightsConnectionString` | parameter | Connection string used to link the Function App to Application Insights. |
| `storageName` | variable | Deterministic storage account name derived from the Function App name. |
| `planName` | variable | App Service plan name derived from the Function App name. |

### `infra/bicep/modules/keyVault.bicep`

| Variable | Type | Description |
| --- | --- | --- |
| `name` | parameter | Name of the Key Vault. |
| `location` | parameter | Azure region for the Key Vault. |
| `tags` | parameter | Optional tags applied to the Key Vault. |
| `tenantId` | parameter | Azure AD tenant ID used for Key Vault configuration. |
| `functionPrincipalId` | parameter | Managed identity principal ID granted access to secrets. |
| `secrets` | secure parameter | Object map of secret names and values to provision in the Key Vault (defaults to placeholder values). |

### `infra/modules/storage.bicep`

| Variable | Type | Description |
| --- | --- | --- |
| `location` | parameter | Azure region for the storage account. |
| `storageAccountName` | parameter | Globally unique storage account name. |
| `containers` | parameter | List of blob containers to create (`landing`, `practice`, `patient`, `equipment`, `service` by default). |
| `tags` | parameter | Optional tags applied to the storage account. |

### `infra/modules/sql.bicep`

| Variable | Type | Description |
| --- | --- | --- |
| `namePrefix` | parameter | Prefix used to derive the SQL server and database names. |
| `location` | parameter | Azure region where the logical server and database are deployed. |
| `adminLogin` | parameter | Administrator login applied to the logical SQL server. |
| `adminPassword` | secure parameter | Administrator password for the SQL server. |
| `tags` | parameter | Optional tags applied to the SQL resources. |

