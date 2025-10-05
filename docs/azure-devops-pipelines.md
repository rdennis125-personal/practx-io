# Azure DevOps Pipelines for Practx

The repository now supports Azure DevOps pipelines for both infrastructure provisioning and the Practx Static Web App deployment. This guide explains what each pipeline does and how to configure the required variables and service connections.

## Infrastructure pipeline (`pipelines/practx-infra-azure-pipelines.yml`)

This pipeline validates and deploys the Bicep templates under `infra/bicep/` using the Azure CLI. It runs a `what-if` preview before applying changes to help you understand the impact of the deployment.

### Triggers
- Branch: `main`
- Paths: `infra/**` and the pipeline definition itself

### Stages
1. **Validate** – Executes `az deployment group what-if` against the target resource group.
2. **Deploy** – Runs `az deployment group create` to apply the Bicep template when validation succeeds.

### Required configuration
Create a variable group named **`Practx-Infra`** (or define equivalent pipeline variables) with the following values:

| Variable | Description |
| --- | --- |
| `AZURE_SERVICE_CONNECTION` | Name of an Azure Resource Manager service connection with permissions to the target subscription/resource group. |
| `AZ_RESOURCE_GROUP` | Resource group that will host the Practx infrastructure. |
| `AZ_LOCATION` | Azure region for the deployment (set to `westus2` for all Practx environments). |
| `NAME_PREFIX` | Prefix applied to deployed resource names (for example `practx`). |
| `TENANT_ID` | Azure AD tenant ID used when creating Key Vault access policies. |
| `FUNCTION_SKU` | *(Optional)* Azure Functions plan SKU. Defaults to `Y1` if omitted. |

## Static Web App pipeline (`pipelines/practx-swa-azure-pipelines.yml`)

This pipeline deploys the contents of `practx-swa/` to Azure Static Web Apps using the official Azure DevOps task. It installs API dependencies and then uploads the frontend and Azure Functions API.

### Triggers
- Branch: `main`
- Paths: `practx-swa/**` and the pipeline definition itself

### Stage
- **BuildAndDeploy** – Installs Node.js, restores the API packages, and calls `AzureStaticWebApp@0` to publish the site.

### Required configuration
Create a variable group named **`Practx-SWA`** (or define the variables directly on the pipeline) with the following entries:

| Variable | Description |
| --- | --- |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Deployment token for the target Static Web App environment. |
| `APP_LOCATION` | *(Optional)* Path to the frontend source relative to the repo root. Defaults to `practx-swa/frontend`. |
| `API_LOCATION` | *(Optional)* Path to the Azure Functions API relative to the repo root. Defaults to `practx-swa/api`. |

### Notes
- The Static Web App task runs in “skip build” mode because the frontend is plain HTML/CSS/JS. Adjust the task inputs if you later introduce a build step.
- The pipeline installs API dependencies with `npm install` so that runtime packages are validated before deployment.

## Running the pipelines
1. Import each YAML file into Azure DevOps as a new pipeline, pointing to the corresponding path in this repository.
2. Link the appropriate variable group under **Pipeline settings → Variables**.
3. Queue a manual run to test connectivity and confirm that the infrastructure deploys successfully and the Static Web App publishes without errors.

These additions provide a fully supported alternative to the existing GitHub Actions workflow for teams that prefer Azure DevOps for CI/CD.
