# practx-io / practx

This repository bootstraps the practx.io platform. It includes the Next.js web experience, .NET 8 API, Stripe webhook function, Azure infrastructure as code (Bicep), API Management policy, SQL schemas, and Azure DevOps pipeline definitions required for the Equipment Lifecycle Management (ELM) module.

Hosted in Git, there is CICD integration with Azure Dev Center, if it works.

## Deployment paths

- **GitHub + Azure Dev Center** – the original workflow that syncs the `Environments/` catalog and lets developers self-serve environments from the Developer Portal.
- **GitHub only (no Dev Center)** – run the Bicep templates directly with the Azure CLI and keep shipping the Static Web App through GitHub Actions. See [Using GitHub Without Azure Dev Center](docs/github-without-devcenter.md).
- **GitHub Actions infrastructure (modular)** – trigger the individual workflows under `.github/workflows/infra-*.yml` (storage, API Management, SQL) to practice deploying each resource type from GitHub Actions.
- **Azure DevOps pipelines** – reuse the YAML definitions under `pipelines/` to validate and deploy infrastructure or publish the Static Web App from Azure DevOps. Details live in [Azure DevOps Pipelines for Practx](docs/azure-devops-pipelines.md).

## Table of Contents

- [Deployment paths](#deployment-paths)
- [Quick Start](#quick-start)
- [Azure Dev Center catalog](#azure-dev-center-catalog)
- [Structure](#structure)
- [Getting Started](#getting-started)
- [Dev Center automation](#dev-center-automation)

## Styling with the Practx brand system

The web application imports the source-of-truth brand tokens from `UX/brand.css` at the app shell. Keep UI changes aligned with the design system by following these guardrails:

- DM Sans is loaded globally via `app/head.tsx`; do not add additional font packages.
- Use the `@/ui` primitives (Button, Input, Card, Alert, Navbar, Tabs, Toast, Modal, ThemeToggle) whenever possible—they wrap the CSS primitives shipped in `UX/brand.css` and include accessibility defaults.
- Tailwind utilities are mapped to the token set (`primary`, `accent`, `neutral`, etc.) in `tailwind.config.ts`. Stick to those semantic names or reference the CSS variables directly (e.g., `var(--color-primary-800)`).
- Run `npm run scan:tokens` inside `Practx/apps/web` to surface legacy hard-coded colors, radii, and shadows that still need migration.
- Component and accessibility tests live under `src/ui/__tests__`; run `npm test` after modifying UI primitives to ensure coverage and axe checks stay green.

See `MIGRATION_REPORT.md` for detailed progress, mapping tables, and follow-up items.

## Quick Start

> Want to deploy straight from GitHub without touching Azure Dev Center? Follow the streamlined instructions in [Using GitHub Without Azure Dev Center](docs/github-without-devcenter.md) and then return here when you are ready to adopt Dev Center again.

### Prerequisites

1. Azure subscription with permissions to create resource groups, Azure Dev Center environments, and the resources listed below.
2. Azure CLI (latest) with Bicep support (`az bicep install`).
3. Access to the Azure Dev Center/Developer Portal where the `DEV` environment type is published.【F:Environments/README.md†L3-L22】
4. GitHub repository administrator rights to configure Actions secrets/variables.
5. Application runtimes for local validation as needed: Node.js 18 for the Next.js web app and .NET 8 for the API and Stripe Function.【F:Practx/infra/modules/appservice.bicep†L33-L62】【F:Practx/apps/api/Practx.Api.csproj†L1-L11】【F:Practx/infra/modules/functions.bicep†L35-L68】

### One-time GitHub setup (OIDC)

1. Create (or reuse) an Entra application registration and add a Federated Credential that trusts this repository. Use the `repo:<org>/<repo>:ref:refs/heads/main` subject (adjust branch as needed) and audience `api://AzureADTokenExchange` per the Azure AD OIDC guidance.
2. In the repository **Settings → Secrets and variables → Actions**, add:
   - `AZURE_TENANT_ID` (variable) – target tenant ID used by the Dev Center catalog sync workflow.【F:.github/workflows/devcenter-catalog-sync.yml†L24-L37】
   - `AZURE_SUBSCRIPTION_ID` (variable) – subscription ID that hosts the Dev Center resources.【F:.github/workflows/devcenter-catalog-sync.yml†L24-L37】
   - `AZURE_CLIENT_ID` (secret) – client ID of the Entra app registration configured above.【F:.github/workflows/devcenter-catalog-sync.yml†L24-L37】
   - `AZURE_DEV_CENTER_RG`, `AZURE_DEVCENTER`, and `AZURE_CATALOG` (variables) – the Dev Center resource group, Dev Center name, and catalog name consumed by the sync workflow.【F:.github/workflows/devcenter-catalog-sync.yml†L40-L49】
3. Capture the Stripe keys, SQL administrator credentials, B2C tenant details, and storage connection string you will inject into Key Vault during environment creation (see the tables below for specifics).

### Catalog & Environment Types

1. Ensure the `Environments/` folder (including `EnvironmentDefinitions/practx-*`) is committed on the branch used for the Dev Center catalog sync.【F:Environments/README.md†L3-L18】【F:Environments/EnvironmentDefinitions/practx-appservice/main.bicep†L1-L40】
2. In the Azure portal, verify the Dev Center catalog is pointed at this branch and that the `DEV` environment type exists (matching the allowed values baked into the templates).【F:Environments/EnvironmentDefinitions/practx-appservice/main.bicep†L4-L13】【F:Environments/EnvironmentDefinitions/practx-shared-storage/main.bicep†L4-L21】

### Deploy the DEV environment (Developer Portal)

1. In the Azure Developer Portal, choose **Create environment** and pick the catalog that contains the practx.io assets.
2. Select the `dev-platform` environment definition, which orchestrates the `practx-*` modules in this repository.【F:Environments/EnvironmentDefinitions/practx-appservice/main.bicep†L27-L39】【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L49-L70】
3. Set parameters:
   - `environmentType`: `DEV`.
   - `location`: default to the target region (defaults to the resource group location if unchanged).【F:Environments/EnvironmentDefinitions/practx-apim/main.bicep†L1-L16】
   - `baseName`: accept `practx` unless a different prefix is required.【F:Environments/EnvironmentDefinitions/practx-apim/main.bicep†L12-L18】
   - Supply secure values for `sqlAdminLogin`, `sqlAdminPassword`, Stripe keys, B2C identifiers/policies, and storage connection string so that Key Vault secrets can be seeded (see Variables & Secrets Reference for the full list).【F:Environments/EnvironmentDefinitions/practx-sql/main.bicep†L12-L31】【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L15-L44】
   - Leave optional inputs such as `policyOverride`, `storageAccountSku`, or `enableHierarchicalNamespace` at their defaults unless you need overrides.【F:Environments/EnvironmentDefinitions/practx-apim/main.bicep†L15-L20】【F:Environments/EnvironmentDefinitions/practx-shared-storage/main.bicep†L12-L21】
4. Submit the deployment and monitor progress until the environment reaches **Succeeded**.

**Infra components provisioned**

- Azure API Management Developer SKU enforcing the entitlement policy.【F:Practx/infra/modules/apim.bicep†L7-L33】
- Application Insights instance for telemetry (connection string exported for other modules).【F:Practx/infra/modules/insights.bicep†L1-L18】
- Premium v3 Linux App Service plan with web (Next.js) and API (.NET 8) apps wired to Key Vault secrets.【F:Practx/infra/modules/appservice.bicep†L11-L123】
- Azure Functions Consumption plan hosting the Stripe webhook function, backed by the shared storage account and Key Vault secrets.【F:Practx/infra/modules/functions.bicep†L15-L75】
- Azure Key Vault seeded with SQL, Stripe, B2C, and storage secrets for downstream apps.【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L49-L70】
- Azure SQL flexible server + database using the supplied administrator credentials.【F:Environments/EnvironmentDefinitions/practx-sql/main.bicep†L24-L36】
- Shared StorageV2 account (Data Lake optional) for artifacts and Functions storage.【F:Environments/EnvironmentDefinitions/practx-shared-storage/main.bicep†L12-L47】

### Verify the deployment

Run the following from a terminal configured with the same subscription used by the Dev Center environment:

```
az account show --output table
az group list --query "[].{Name:name,Location:location}" --output table
# Optional spot checks (replace name patterns as needed):
# az storage account list --query "[].{Name:name,Location:primaryLocation}" --output table
# az keyvault list --query "[].{Name:name,Location:location}" --output table
```

Use the Azure portal to confirm the resource group contains the components listed above, and review the Developer Portal deployment history for detailed status.

### App configuration

1. From the environment deployment outputs, note the Key Vault name/URI, SQL connection string, Application Insights connection string, and Storage account connection string.【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L49-L70】【F:Environments/EnvironmentDefinitions/practx-application-insights/main.bicep†L18-L28】【F:Environments/EnvironmentDefinitions/practx-sql/main.bicep†L24-L36】
2. Verify that the App Service apps and Function app picked up their app settings via Key Vault references (e.g., `SQLCONN`, `STRIPE_*`, `B2C_*`, `STORAGE_CONNECTION`).【F:Practx/infra/modules/appservice.bicep†L34-L117】【F:Practx/infra/modules/functions.bicep†L35-L68】
3. Populate the SQL database with the baseline schema and optional seed data before testing the API.【F:Practx/schemas/sql/001_core.sql†L1-L39】【F:Practx/schemas/sql/010_seed.sql†L1-L40】
4. If you deploy additional application code from CI/CD, replicate these settings as App Service application settings or Azure Function configuration. For local development, place the same values in `.env.local`, `local.settings.json`, or user secrets as appropriate.

### First run / Smoke test

1. Browse to `https://<web-app-name>.azurewebsites.net` to confirm the Next.js front end loads with the correct API base URL and B2C settings sourced from Key Vault.【F:Practx/infra/modules/appservice.bicep†L34-L62】【F:Practx/apps/web/lib/config.ts†L1-L8】
2. Exercise the API by invoking the placeholder Stripe checkout endpoint (no auth required):

```
curl https://<api-app-name>.azurewebsites.net/billing/checkout
```

The response should include a `checkoutUrl` as defined in the API project.【F:Practx/apps/api/Program.cs†L164-L168】

### CI/CD hooks in this repo

- **Validate Bicep templates** – GitHub Action that runs on pushes and pull requests touching `*.bicep`, installing the Bicep CLI and building only changed files.【F:.github/workflows/bicep-validate.yml†L1-L69】
- **Sync Dev Center catalog** – GitHub Action triggered by `Environments/**` changes on `main` (or manually) that logs in via OIDC and calls `az devcenter admin catalog sync`. Ensure the variables listed in the prerequisites are set so the workflow can authenticate.【F:.github/workflows/devcenter-catalog-sync.yml†L1-L49】

### Variables & Secrets Reference

#### Bicep parameters

| PARAMETER | TYPE | DEFAULT | DESCRIPTION | WHERE DEFINED |
| --- | --- | --- | --- | --- |
| `location` | string | `resourceGroup().location` | Azure region for the deployment. | `Environments/EnvironmentDefinitions/practx-apim/main.bicep`【F:Environments/EnvironmentDefinitions/practx-apim/main.bicep†L1-L18】<br>`Environments/EnvironmentDefinitions/practx-application-insights/main.bicep`【F:Environments/EnvironmentDefinitions/practx-application-insights/main.bicep†L1-L24】<br>`Environments/EnvironmentDefinitions/practx-appservice/main.bicep`【F:Environments/EnvironmentDefinitions/practx-appservice/main.bicep†L1-L27】<br>`Environments/EnvironmentDefinitions/practx-functions/main.bicep`【F:Environments/EnvironmentDefinitions/practx-functions/main.bicep†L1-L33】<br>`Environments/EnvironmentDefinitions/practx-keyvault/main.bicep`【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L1-L52】<br>`Environments/EnvironmentDefinitions/practx-sql/main.bicep`【F:Environments/EnvironmentDefinitions/practx-sql/main.bicep†L1-L32】<br>`Environments/EnvironmentDefinitions/practx-shared-storage/main.bicep`【F:Environments/EnvironmentDefinitions/practx-shared-storage/main.bicep†L1-L47】 |
| `environmentType` | string | _(required)_ | Dev Center environment type (`DEV`, `QA1`, `PROD`). | `Environments/EnvironmentDefinitions/practx-apim/main.bicep`【F:Environments/EnvironmentDefinitions/practx-apim/main.bicep†L4-L18】<br>`Environments/EnvironmentDefinitions/practx-application-insights/main.bicep`【F:Environments/EnvironmentDefinitions/practx-application-insights/main.bicep†L4-L20】<br>`Environments/EnvironmentDefinitions/practx-appservice/main.bicep`【F:Environments/EnvironmentDefinitions/practx-appservice/main.bicep†L4-L30】<br>`Environments/EnvironmentDefinitions/practx-functions/main.bicep`【F:Environments/EnvironmentDefinitions/practx-functions/main.bicep†L4-L35】<br>`Environments/EnvironmentDefinitions/practx-keyvault/main.bicep`【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L4-L53】<br>`Environments/EnvironmentDefinitions/practx-sql/main.bicep`【F:Environments/EnvironmentDefinitions/practx-sql/main.bicep†L4-L31】<br>`Environments/EnvironmentDefinitions/practx-shared-storage/main.bicep`【F:Environments/EnvironmentDefinitions/practx-shared-storage/main.bicep†L4-L43】 |
| `baseName` | string | `'practx'` | Base name combined with environment type for resource naming. | `Environments/EnvironmentDefinitions/practx-apim/main.bicep`【F:Environments/EnvironmentDefinitions/practx-apim/main.bicep†L12-L28】<br>`Environments/EnvironmentDefinitions/practx-application-insights/main.bicep`【F:Environments/EnvironmentDefinitions/practx-application-insights/main.bicep†L12-L24】<br>`Environments/EnvironmentDefinitions/practx-appservice/main.bicep`【F:Environments/EnvironmentDefinitions/practx-appservice/main.bicep†L12-L36】<br>`Environments/EnvironmentDefinitions/practx-functions/main.bicep`【F:Environments/EnvironmentDefinitions/practx-functions/main.bicep†L12-L39】<br>`Environments/EnvironmentDefinitions/practx-keyvault/main.bicep`【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L12-L52】<br>`Environments/EnvironmentDefinitions/practx-sql/main.bicep`【F:Environments/EnvironmentDefinitions/practx-sql/main.bicep†L12-L31】 |
| `policyOverride` | string | `''` | Optional XML policy override for API Management entitlement checks. | `Environments/EnvironmentDefinitions/practx-apim/main.bicep`【F:Environments/EnvironmentDefinitions/practx-apim/main.bicep†L15-L28】 |
| `keyVaultId` | string | _(required)_ | Resource ID of the Key Vault supplying secrets to App Service or Functions. | `Environments/EnvironmentDefinitions/practx-appservice/main.bicep`【F:Environments/EnvironmentDefinitions/practx-appservice/main.bicep†L15-L35】<br>`Environments/EnvironmentDefinitions/practx-functions/main.bicep`【F:Environments/EnvironmentDefinitions/practx-functions/main.bicep†L22-L38】 |
| `keyVaultName` | string | _(required)_ | Name of the Key Vault referenced by the apps. | `Environments/EnvironmentDefinitions/practx-appservice/main.bicep`【F:Environments/EnvironmentDefinitions/practx-appservice/main.bicep†L15-L35】<br>`Environments/EnvironmentDefinitions/practx-functions/main.bicep`【F:Environments/EnvironmentDefinitions/practx-functions/main.bicep†L22-L38】 |
| `appInsightsConnectionString` | secure string | _(required)_ | Application Insights connection string injected into App Service/Functions. | `Environments/EnvironmentDefinitions/practx-appservice/main.bicep`【F:Environments/EnvironmentDefinitions/practx-appservice/main.bicep†L21-L35】<br>`Environments/EnvironmentDefinitions/practx-functions/main.bicep`【F:Environments/EnvironmentDefinitions/practx-functions/main.bicep†L18-L37】 |
| `storageAccountName` | string | _(required)_ | Existing storage account backing the Functions runtime. | `Environments/EnvironmentDefinitions/practx-functions/main.bicep`【F:Environments/EnvironmentDefinitions/practx-functions/main.bicep†L15-L38】 |
| `sqlAdminLogin` | string | _(required)_ | SQL server administrator login. | `Environments/EnvironmentDefinitions/practx-sql/main.bicep`【F:Environments/EnvironmentDefinitions/practx-sql/main.bicep†L12-L31】 |
| `sqlAdminPassword` | secure string | _(required)_ | SQL server administrator password. | `Environments/EnvironmentDefinitions/practx-sql/main.bicep`【F:Environments/EnvironmentDefinitions/practx-sql/main.bicep†L15-L31】 |
| `sqlConnectionString` | secure string | _(required)_ | Connection string to seed into Key Vault (`SQLCONN`). | `Environments/EnvironmentDefinitions/practx-keyvault/main.bicep`【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L15-L63】 |
| `stripeSecretKey` | secure string | _(required)_ | Stripe secret API key stored in Key Vault. | `Environments/EnvironmentDefinitions/practx-keyvault/main.bicep`【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L19-L63】 |
| `stripePublicKey` | string | _(required)_ | Stripe publishable key stored in Key Vault for the API. | `Environments/EnvironmentDefinitions/practx-keyvault/main.bicep`【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L19-L63】 |
| `stripePriceId` | string | _(required)_ | Stripe price ID referenced by the app and webhook. | `Environments/EnvironmentDefinitions/practx-keyvault/main.bicep`【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L19-L63】 |
| `stripeWebhookSecret` | secure string | _(required)_ | Stripe webhook signing secret for the Function. | `Environments/EnvironmentDefinitions/practx-keyvault/main.bicep`【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L19-L63】 |
| `b2cTenant` | string | _(required)_ | Entra External ID (B2C) tenant name stored in Key Vault. | `Environments/EnvironmentDefinitions/practx-keyvault/main.bicep`【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L33-L63】 |
| `b2cClientId` | string | _(required)_ | Entra External ID (B2C) application client ID. | `Environments/EnvironmentDefinitions/practx-keyvault/main.bicep`【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L33-L63】 |
| `b2cSignInPolicy` | string | _(required)_ | Entra External ID sign-in policy name. | `Environments/EnvironmentDefinitions/practx-keyvault/main.bicep`【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L33-L63】 |
| `storageConnectionString` | secure string | _(required)_ | Storage connection string stored in Key Vault for API/Functions. | `Environments/EnvironmentDefinitions/practx-keyvault/main.bicep`【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L33-L63】 |
| `storageAccountSku` | string | `'Standard_LRS'` | Storage account SKU for the shared storage definition. | `Environments/EnvironmentDefinitions/practx-shared-storage/main.bicep`【F:Environments/EnvironmentDefinitions/practx-shared-storage/main.bicep†L12-L30】 |
| `enableHierarchicalNamespace` | bool | `false` | Toggle Data Lake Gen2 hierarchical namespace. | `Environments/EnvironmentDefinitions/practx-shared-storage/main.bicep`【F:Environments/EnvironmentDefinitions/practx-shared-storage/main.bicep†L20-L38】 |

#### Secrets and configuration

| SECRET NAME | WHERE USED | PURPOSE | HOW TO SET |
| --- | --- | --- | --- |
| `AZURE_TENANT_ID` | `.github/workflows/devcenter-catalog-sync.yml`【F:.github/workflows/devcenter-catalog-sync.yml†L24-L49】 | Tenant ID used for OIDC login and Dev Center catalog sync. | GitHub repository variable pointing to the Azure AD tenant hosting Dev Center. |
| `AZURE_SUBSCRIPTION_ID` | `.github/workflows/devcenter-catalog-sync.yml`【F:.github/workflows/devcenter-catalog-sync.yml†L24-L49】 | Subscription that hosts the Dev Center resources. | GitHub repository variable containing the subscription GUID. |
| `AZURE_CLIENT_ID` | `.github/workflows/devcenter-catalog-sync.yml`【F:.github/workflows/devcenter-catalog-sync.yml†L24-L37】 | Entra application client ID used for OIDC authentication. | GitHub repository secret referencing the federated credentials app registration. |
| `AZURE_DEV_CENTER_RG` | `.github/workflows/devcenter-catalog-sync.yml`【F:.github/workflows/devcenter-catalog-sync.yml†L40-L49】 | Resource group containing the Dev Center. | GitHub repository variable set to the resource group name. |
| `AZURE_DEVCENTER` | `.github/workflows/devcenter-catalog-sync.yml`【F:.github/workflows/devcenter-catalog-sync.yml†L40-L49】 | Dev Center resource name for catalog sync. | GitHub repository variable with the Dev Center name. |
| `AZURE_CATALOG` | `.github/workflows/devcenter-catalog-sync.yml`【F:.github/workflows/devcenter-catalog-sync.yml†L40-L49】 | Catalog name targeted by the sync workflow. | GitHub repository variable set to the catalog resource name. |
| `SQLCONN` | Key Vault secret referenced by App Service & Functions; API reads the value at runtime.【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L49-L70】【F:Practx/infra/modules/appservice.bicep†L79-L117】【F:Practx/infra/modules/functions.bicep†L35-L68】【F:Practx/apps/api/Program.cs†L10-L16】 | SQL connection string shared across the API and Functions. | Store as a Key Vault secret populated during environment deployment (value from SQL module output). |
| `STRIPE_SECRET_KEY` | Key Vault secret consumed by App Service and Functions.【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L49-L70】【F:Practx/infra/modules/appservice.bicep†L79-L104】【F:Practx/infra/modules/functions.bicep†L35-L67】 | Stripe secret API key for server-side calls and webhooks. | Store as a Key Vault secret using the Stripe dashboard value. |
| `STRIPE_PUBLIC_KEY` | Key Vault secret exposed to the API app settings.【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L49-L70】【F:Practx/infra/modules/appservice.bicep†L79-L105】 | Stripe publishable key used by the API/frontend. | Store as a Key Vault secret from the Stripe dashboard. |
| `STRIPE_PRICE_ID` | Key Vault secret consumed by the API and Function apps.【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L49-L70】【F:Practx/infra/modules/appservice.bicep†L79-L104】【F:Practx/infra/modules/functions.bicep†L35-L67】 | Stripe price identifier for subscription enforcement. | Store as a Key Vault secret using the target Stripe price ID. |
| `STRIPE_WEBHOOK_SECRET` | Key Vault secret for the Stripe webhook Function.【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L49-L70】【F:Practx/infra/modules/functions.bicep†L35-L64】 | Verifies inbound Stripe webhook signatures. | Store as a Key Vault secret generated by Stripe webhook setup. |
| `B2C_TENANT` | Key Vault secret injected into App Service apps.【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L49-L63】【F:Practx/infra/modules/appservice.bicep†L34-L117】 | Entra External ID tenant domain for authentication. | Store as a Key Vault secret sourced from the B2C tenant. |
| `B2C_CLIENT_ID` | Key Vault secret injected into App Service apps.【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L49-L63】【F:Practx/infra/modules/appservice.bicep†L34-L117】 | Entra External ID application (SPA/API) client ID. | Store as a Key Vault secret from the B2C app registration. |
| `B2C_SIGNIN_POLICY` | Key Vault secret injected into App Service apps.【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L49-L63】【F:Practx/infra/modules/appservice.bicep†L34-L117】 | Entra External ID sign-in/user flow policy name. | Store as a Key Vault secret from the B2C user flow. |
| `STORAGE_CONNECTION` | Key Vault secret consumed by App Service and Functions.【F:Environments/EnvironmentDefinitions/practx-keyvault/main.bicep†L49-L63】【F:Practx/infra/modules/appservice.bicep†L79-L117】【F:Practx/infra/modules/functions.bicep†L35-L68】 | Storage account connection string for data lake or integration scenarios. | Store as a Key Vault secret populated from the storage account access keys. |

### Troubleshooting

- **Catalog sync issues** – Confirm the `Environments/` folder is present on the synced branch and that the GitHub variables match the Dev Center resource names.【F:Environments/README.md†L3-L18】【F:.github/workflows/devcenter-catalog-sync.yml†L40-L49】
- **Environment type mismatch** – Ensure the requested environment type (`DEV`, `QA1`, or `PROD`) is available in Dev Center and allowed by the templates.【F:Environments/EnvironmentDefinitions/practx-shared-storage/main.bicep†L4-L21】
- **Insufficient RBAC** – Grant the Dev Center managed identity and your user account the necessary contributor rights on the target subscription/resource group before retrying the deployment.
- **Bicep validation errors** – Run `az bicep build --file Environments/dev-platform/main.bicep` locally to catch template issues before committing.
- **OIDC authentication failures** – Verify the `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, and federated credential subject/audience in the Entra app registration match the GitHub workflow configuration.【F:.github/workflows/devcenter-catalog-sync.yml†L24-L37】

### Next Steps

- Add QA and PROD variants of the environment definition once DEV stabilizes.
- Wire up application deployment workflows (e.g., build and deploy web/API/Function apps) to complement the infra provisioning.
- Review Azure cost alerts for App Service, SQL, API Management, and other billable resources to avoid surprises.

## Azure Dev Center catalog

The [`Environments/`](Environments/README.md) folder contains the Azure Dev Center catalog used to
provision DEV, QA1, and PROD environments.  Each environment definition is made up of an
`environment.yaml` manifest plus the referenced Bicep template.  GitHub Actions validate every Bicep
file on pull requests and `main` pushes, and the catalog automatically synchronizes whenever
`Environments/**` changes on `main`.

To add a new environment definition:

1. Create a folder under `Environments/EnvironmentDefinitions/` with an `environment.yaml` manifest
   and a Bicep template.
2. Update documentation as needed.
3. Open a pull request; the Bicep validation workflow must pass.
4. Merge to `main` to trigger a catalog sync via the Dev Center GitHub Action.

Secrets required by the workflows are detailed in the **Dev Center automation** section below.

## Structure

```
Practx/
├─ apps/
│  ├─ web/                     # Next.js 14 application (marketing + /app + /elm)
│  └─ api/                     # .NET 8 minimal API
├─ functions/
│  └─ StripeWebhook/           # .NET 8 isolated Azure Function handling Stripe events
├─ infra/
│  ├─ main.bicep               # Root deployment template
│  ├─ main.parameters.json     # Sample parameters
│  └─ modules/                 # Reusable Bicep modules
├─ apim/policies/              # APIM entitlement enforcement
├─ schemas/                    # SQL DDL and OpenAPI contract
├─ .ado/pipelines/             # Azure DevOps pipelines (web, api, function)
└─ README.md
```

## Getting Started

1. Install dependencies for each project:
   - `cd Practx/apps/web && npm install`
   - `cd Practx/apps/api && dotnet restore`
   - `cd Practx/functions/StripeWebhook && dotnet restore`
2. When using Visual Studio, open `Practx/Practx.sln` to load the API and Stripe webhook projects (`Practx/apps/api/Practx.Api.csproj`
   and `Practx/functions/StripeWebhook/StripeWebhook.csproj`). Opening the repository folder directly (File → Open → Folder…)
   also works if you want Visual Studio to discover the projects without the solution file.
3. Provision infrastructure with `az deployment group create` using `infra/main.bicep`.
4. Configure Entra External ID (B2C) user flow and update Key Vault secrets for B2C and Stripe settings.
5. Deploy the apps using the provided Azure DevOps pipelines or manually (`npm run build`, `dotnet publish`, etc.).
6. Seed the SQL database with `schemas/sql/001_core.sql` (and optional seed data) before running the app.

Refer to the spec for full acceptance criteria: registration via B2C, Stripe paywall gating the `/elm` workspace, SQL persistence, APIM entitlement enforcement, and logging via Application Insights.

## Dev Center automation

Two automations support the Dev Center experience:

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `.github/workflows/bicep-validate.yml` | Pull requests and pushes to `main` | Ensures every Bicep template in the repo builds successfully. |
| `.github/workflows/devcenter-catalog-sync.yml` | Push to `main` that touches `Environments/**` | Uses the Azure Dev Center admin API to sync the catalog. |

### Required GitHub secrets / variables

| Name | Type | Description |
| --- | --- | --- |
| `AZURE_CREDENTIALS` | secret | Output of `az ad sp create-for-rbac` with access to the Dev Center resource group. |
| `AZURE_SUBSCRIPTION_ID` | secret or variable | Subscription that hosts the Dev Center. |
| `AZURE_DEV_CENTER_RG` | secret or variable | Resource group for the Dev Center (`<RG_NAME>`). |
| `AZURE_DEV_CENTER_NAME` | secret or variable | Dev Center resource name (`<DEV_CENTER_NAME>`). |
| `AZURE_DEV_CENTER_CATALOG_NAME` | secret or variable | Catalog resource name (`<CATALOG_NAME>`). |

The catalog sync workflow logs in with `AZURE_CREDENTIALS`, installs the Dev Center CLI extension, and
invokes `az devcenter admin catalog sync` using the remaining variables.

### Azure DevOps pipeline

An equivalent Azure Pipelines definition is available at
`Practx/.ado/pipelines/environment-catalog-ci.yml` for teams running CI/CD in Azure DevOps.


## Payments and settlements prototype

### Components

- `apps/orchestrator/Practx.Orchestrator.sln` – Azure Functions solution hosting the payment orchestration stubs (dealer, Resolve, Stripe Connect mocks).
- `apps/woo-practx-payments` – WooCommerce plugin exposing the three payment options, dealer checkout fields, acknowledgement REST API, and admin dashboards.
- `infra/bicep` – Bicep modules for the orchestrator Function App, Service Bus namespace/topic, Application Insights, and Key Vault.
- `pipelines` – Azure DevOps YAML pipelines for orchestrator CI/CD and Woo plugin packaging.

### Local debugging (Visual Studio)

1. Restore tools if needed with `dotnet restore` from the `apps/orchestrator` directory.
2. Open `apps/orchestrator/Practx.Orchestrator.sln`, set **Practx.Orchestrator** as the startup project, and press <kbd>F5</kbd>.
3. Update `apps/orchestrator/src/Practx.Orchestrator/local.settings.json` to match your local secrets. Required keys:
   ```json
   {
     "STRIPE_TEST_KEY": "sk_test_mock",
     "RESOLVE_TEST_KEY": "resolve_test_mock",
     "SERVICE_BUS_CONNECTION": "Endpoint=sb://local/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=local",
     "AUTO_RELEASE_DAYS": "7",
     "DEALER_TIMEOUT_MINUTES": "30",
     "ACK_URL_BASE": "http://localhost:7071/api/ack",
     "WEBHOOK_HMAC_SECRET": "local_secret"
   }
   ```
4. Use the HTTP samples in `docs/local-debug.md` to simulate dealer approvals, Resolve funding, acknowledgement, and disputes end to end.

### Azure DevOps pipelines

1. Import `pipelines/orchestrator-ci-cd.yml` and `pipelines/woo-plugin-build.yml` into Azure DevOps.
2. Create a service connection with access to the target subscription for the Function App deploy stage.
3. Define variable groups for secrets (Key Vault-backed groups recommended). Expected variables:
   - `AZ_SUBSCRIPTION`
   - `AZ_RESOURCE_GROUP`
   - `AZ_FUNCTIONAPP_NAME`
   - Key Vault group linked via `azureKeyVault` references for STRIPE/RESOLVE secrets.
4. The Woo pipeline publishes `woo-practx-payments.zip` as an artifact ready for WordPress deployment.

### Infrastructure deployment

1. Run `infra/scripts/deploy.sh <resource-group> <name-prefix> <tenant-id> <location>` for a dry run (what-if).
2. Append `--deploy` to execute the deployment.
3. The script provisions:
   - Linux Azure Function App with managed identity and storage account.
   - Service Bus namespace with the `payments` topic and dealer/resolve/settlement subscriptions.
   - Application Insights instance for telemetry.
   - Key Vault with an access policy granting the Function App identity `get`/`list` permissions for secrets (Stripe/Resolve keys, Service Bus connection string).
4. Update secrets in Key Vault post-deployment with actual vendor credentials.

### WooCommerce configuration

1. Copy `apps/woo-practx-payments` into your WordPress plugins directory and activate **Practx Payments**.
2. Configure the orchestrator endpoint and webhook secret from the **Practx Payments → Dealer Account Matches** admin page.
3. Enable the new payment gateways under **WooCommerce → Settings → Payments**.
4. Place a test order using **Bill my dealer account** to exercise the dealer timeout → Resolve fallback path.

Refer to `docs/sequence.md` for sequence diagrams and `docs/local-debug.md` for curl/httpie test plans.
