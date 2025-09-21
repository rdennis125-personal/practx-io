# practx-io / practx

This repository bootstraps the practx.io platform. It includes the Next.js web experience, .NET 8 API, Stripe webhook function, Azure infrastructure as code (Bicep), API Management policy, SQL schemas, and Azure DevOps pipeline definitions required for the Equipment Lifecycle Management (ELM) module.

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
