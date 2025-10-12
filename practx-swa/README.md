# Practx Static Web App

Production-ready starter for the Practx marketing site running on Azure Static Web Apps (Free tier) with an Azure Functions API for lead capture.

## Features

- Vanilla HTML/CSS/JS landing pages for Practx offerings (hygiene, outreach, franchise)
- Accessible, mobile-first design with shared navigation and footer
- Signup form with client-side validation and honeypot field
- Azure Functions API that stores leads in Azure Table Storage
- GitHub Actions workflow for CI/CD to Azure Static Web Apps
- SEO basics: titles, descriptions, Open Graph, robots.txt, sitemap

## Prerequisites

- Azure subscription with permissions to create resources
- GitHub repository with access to configure secrets
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) (2.49+) and [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local) (v4)
- Node.js 18 LTS

## Getting Started Locally

1. Clone the repository and install API dependencies:

   ```bash
   npm install --prefix api
   ```

2. Create `api/local.settings.json` (not committed) to provide a storage connection string when running locally. You can also
   override the blob container names here if your storage account uses non-default names:

   ```json
   {
     "IsEncrypted": false,
     "Values": {
      "PRACTX_WEBJOB_STORAGE": "UseDevelopmentStorage=true",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "STORAGE_TABLE_NAME": "Leads",
      "PRACTX_BLOB_CONTAINER_LANDING": "landing",
      "PRACTX_BLOB_CONTAINER_PRACTICE": "practice",
      "PRACTX_BLOB_CONTAINER_PATIENT": "patient",
      "PRACTX_BLOB_CONTAINER_EQUIPMENT": "equipment",
      "PRACTX_BLOB_CONTAINER_SERVICE": "service"
     }
   }
   ```

3. Start the Azure Functions API:

   ```bash
   npm run start --prefix api
   ```

4. Serve the frontend. You can use any static server, or install the [Static Web Apps CLI](https://learn.microsoft.com/azure/static-web-apps/local-development).

   ```bash
   npx @azure/static-web-apps-cli start ./frontend --api-location ./api
   ```

   The CLI proxies `/api/signup` to the local function.

## Deployment

### GitHub Actions

A workflow at `../.github/workflows/azure-static-web-apps.yml` deploys the app whenever changes are pushed to the `main` branch. The workflow expects a repository secret named `AZURE_STATIC_WEB_APPS_API_TOKEN_MANGO_HILL_0CB59961E` generated from the Azure portal for the Static Web App.

### Azure DevOps Pipelines

An alternative Azure DevOps pipeline definition is available at `pipelines/practx-swa-azure-pipelines.yml`. Import it into Azure DevOps and link a variable group containing `AZURE_STATIC_WEB_APPS_API_TOKEN` (the deployment token) along with any optional `APP_LOCATION` or `API_LOCATION` overrides. See [Azure DevOps Pipelines for Practx](../docs/azure-devops-pipelines.md) for detailed setup steps.

### Azure CLI Bootstrap Script

Use the following script to create the resource group and Static Web App (fill in variables first):

```bash
# variables to set
SUBSCRIPTION_ID=<subs-id>
RG=rg-practx-web
LOCATION=westus2
APP_NAME=practx-website
GITHUB_REPO=https://github.com/<org>/<repo>
GITHUB_BRANCH=main

az account set --subscription $SUBSCRIPTION_ID
az group create -n $RG -l $LOCATION
az staticwebapp create \
  -n $APP_NAME \
  -g $RG \
  --source $GITHUB_REPO \
  --branch $GITHUB_BRANCH \
  --login-with-github \
  --location $LOCATION \
  --sku Free \
  --app-location "frontend" \
  --api-location "api" \
  --output-location ""

# After creation, set Function app settings (in SWA > Environment variables)
# PRACTX_WEBJOB_STORAGE = <connection string to a Storage account>
# STORAGE_TABLE_NAME = Leads
```

### Domain Configuration

1. In the Azure portal, open your Static Web App and add custom domains `practx.io` and `www.practx.io`.
2. Create CNAME DNS records pointing `www` to the SWA default hostname and an ALIAS/ANAME or CNAME (if supported) for the apex `practx.io`.
3. Azure Static Web Apps will validate ownership and automatically issue TLS certificates.

## Project Structure

```
practx-swa/
  frontend/
    assets/
      logo.png
      styles.css
    index.html
    hygiene.html
    franchise.html
    outreach.html
    thank-you.html
    signup.js
    routes.json
    robots.txt
    sitemap.xml
  api/
    Signup/
      function.json
      index.js
    package.json
    host.json
    .funcignore
  README.md
  LICENSE
```

## Environment Configuration

Set the following application settings in Azure Static Web Apps (Environment variables tab) for the production environment:

- `PRACTX_WEBJOB_STORAGE` – connection string for the Storage account used by the API
- `STORAGE_TABLE_NAME` – defaults to `Leads` if not specified
- `PRACTX_BLOB_CONTAINER_LANDING` – blob container name used for general landing requests (defaults to `landing`)
- `PRACTX_BLOB_CONTAINER_PRACTICE` – optional override for practice-specific blobs (defaults to `practice`)
- `PRACTX_BLOB_CONTAINER_PATIENT` – optional override for patient-specific blobs (defaults to `patient`)
- `PRACTX_BLOB_CONTAINER_EQUIPMENT` – optional override for equipment-specific blobs (defaults to `equipment`)
- `PRACTX_BLOB_CONTAINER_SERVICE` – optional override for service-specific blobs (defaults to `service`)
- `ALLOWED_ORIGIN` – optional comma-separated list (e.g., `https://practx.io,https://www.practx.io`)

## Lead Storage

The signup API writes to the `Leads` table with the following schema:

- `PartitionKey`: `web`
- `RowKey`: ISO timestamp plus random suffix
- `Name`, `Email`, `Company`, `Interest`
- `UserAgent`, `IpHash`, `CreatedUtc`

Personally identifiable information is not written to logs, and the function includes basic validation, honeypot detection, and IP hashing for light rate limiting.

## License

MIT License. See [LICENSE](LICENSE) for details.
