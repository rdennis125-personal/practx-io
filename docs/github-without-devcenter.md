# Using GitHub Without Azure Dev Center

Azure Dev Center remains checked into this repository so you can return to it later, but you do not need it to keep shipping from GitHub. This guide walks through a simple "GitHub only" path that provisions the practx infrastructure with the Azure CLI and relies on the existing GitHub Actions workflow to publish the Static Web App.

## When to pick this path

Choose the GitHub-only flow when:

- You are the sole contributor (or have a very small team) and do not need the self-service environment management features from Dev Center yet.
- You prefer to run infrastructure deployments on demand with the Azure CLI instead of through the Dev Center environment definitions.
- You want to continue using GitHub Actions for the Static Web App without wiring Dev Center identities or catalog sync variables.

You can leave the `Environments/` catalog intact. Nothing in the steps below depends on it, so you can revisit Dev Center later without rewriting the infrastructure templates.

## Provision infrastructure directly with the Azure CLI

1. Sign in and select the target subscription:

   ```bash
   az login
   az account set --subscription <subscription-id>
   ```

2. Create (or reuse) a resource group for the practx environment in **West US 2** (the required deployment region):

   ```bash
   az group create --name <resource-group> --location westus2
   ```

3. Deploy the Bicep template that normally runs through Dev Center. The `practix/infra/main.bicep` file emits the App Service plan/web app, API, Functions app, Key Vault, SQL flexible server, Storage account, Application Insights, and API Management resources for the chosen environment label.【F:practix/infra/main.bicep†L1-L87】 Prepare a parameters file (you can start from `practix/infra/main.parameters.json`) with the environment name, base name, admin credentials, Stripe keys, and B2C identifiers—keep the `location` parameter set to `westus2` to match the required region.【F:practix/infra/main.parameters.json†L1-L20】 Then run:

   ```bash
   az deployment group create \
     --resource-group <resource-group> \
     --template-file practix/infra/main.bicep \
     --parameters @practix/infra/main.parameters.json
   ```

   Replace the parameter file path if you keep secrets in a secure location (for example, Azure Key Vault or an encrypted storage account). The deployment outputs include the web app, API app, Function app, SQL connection string, and Key Vault URI for follow-up configuration.【F:practix/infra/main.bicep†L73-L87】

4. Keep the `.github/workflows/bicep-validate.yml` workflow enabled so pull requests still build any changed Bicep files. This guardrail catches template regressions even though you are not provisioning through Dev Center.【F:.github/workflows/bicep-validate.yml†L1-L57】

## Deploy the Static Web App from GitHub

The Static Web App does not rely on Dev Center. The workflow at `practx-swa/.github/workflows/azure-static-web-apps.yml` builds the frontend and API and uploads them when you push to `main` as long as the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret is present.【F:practx-swa/.github/workflows/azure-static-web-apps.yml†L1-L33】

1. In the Azure portal, open the Static Web App you created manually (or via the CLI bootstrap script in `practx-swa/README.md`). Generate a deployment token and store it as the `AZURE_STATIC_WEB_APPS_API_TOKEN` repository secret.
2. Commit changes to `main` to publish. Pull requests continue to generate preview environments without additional configuration.【F:practx-swa/.github/workflows/azure-static-web-apps.yml†L18-L33】

If you prefer to deploy the Static Web App from your local machine instead of GitHub Actions, run the bootstrap script documented in the SWA README to create/update the resource and then push local builds with `az staticwebapp upload`. The script already targets the `frontend` and `api` folders in this repository.【F:practx-swa/README.md†L42-L84】

## What about Dev Center assets?

- Leave the `devcenter-catalog-sync` workflow disabled (or remove its secrets) while you operate in GitHub-only mode. Nothing else in the repo requires those credentials.【F:.github/workflows/devcenter-catalog-sync.yml†L1-L49】
- You can resume Dev Center later by re-enabling the secrets and syncing the catalog. The infrastructure templates and environment definitions remain valid, so no migration work is required.
- Azure DevOps pipelines remain available if you decide to manage deployments there instead of GitHub; they do not conflict with the GitHub-only flow.【F:pipelines/practx-infra-azure-pipelines.yml†L1-L80】【F:pipelines/practx-swa-azure-pipelines.yml†L1-L46】

With these steps you can keep the repository on GitHub, deploy infrastructure with a straightforward CLI invocation, and continue publishing the Static Web App without involving Azure Dev Center.
=======
# Deploy Practx from GitHub Without Azure DevCenter

## Deploy the Static Web App from GitHub

If you prefer to provision or update the Static Web App resource directly instead of relying on GitHub Actions, you can run the Azure CLI commands below (see the [bootstrap script in `practx-swa/README.md`](../practx-swa/README.md) for full context and explanation).

### Bash

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
```

### PowerShell

```powershell
# variables to set
$SUBSCRIPTION_ID = "<subs-id>"
$RG = "rg-practx-web"
$LOCATION = "westus2"
$APP_NAME = "practx-website"
$GITHUB_REPO = "https://github.com/<org>/<repo>"
$GITHUB_BRANCH = "main"

az account set --subscription $SUBSCRIPTION_ID
az group create -n $RG -l $LOCATION
az staticwebapp create `
  -n $APP_NAME `
  -g $RG `
  --source $GITHUB_REPO `
  --branch $GITHUB_BRANCH `
  --login-with-github `
  --location $LOCATION `
  --sku Free `
  --app-location "frontend" `
  --api-location "api" `
  --output-location ""
```