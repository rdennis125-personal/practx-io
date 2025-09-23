# practx-io / practx

This repository bootstraps the practx.io platform. It includes the Next.js web experience, .NET 8 API, Stripe webhook function, Azure infrastructure as code (Bicep), API Management policy, SQL schemas, and Azure DevOps pipeline definitions required for the Equipment Lifecycle Management (ELM) module.

Hosted in Git, there is CICD integration with Azure Dev Center, if it works.

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
practix/
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
   - `cd practix/apps/web && npm install`
   - `cd practix/apps/api && dotnet restore`
   - `cd practix/functions/StripeWebhook && dotnet restore`
2. Provision infrastructure with `az deployment group create` using `infra/main.bicep`.
3. Configure Entra External ID (B2C) user flow and update Key Vault secrets for B2C and Stripe settings.
4. Deploy the apps using the provided Azure DevOps pipelines or manually (`npm run build`, `dotnet publish`, etc.).
5. Seed the SQL database with `schemas/sql/001_core.sql` (and optional seed data) before running the app.

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
`practix/.ado/pipelines/environment-catalog-ci.yml` for teams running CI/CD in Azure DevOps.
