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
| `SQL_ADMIN_LOGIN` | Administrator login for the Azure SQL logical server created by the Bicep deployment. |
| `SQL_ADMIN_PASSWORD` | Secret corresponding to `SQL_ADMIN_LOGIN`; mark as a secret variable in the pipeline. |

## Static Web App pipeline (`pipelines/marketing-swa-azure-pipelines.yml`)

This pipeline deploys the contents of `apps/marketing-swa/` to Azure Static Web Apps using the official Azure DevOps task. It publishes the static frontend and relies on the built-in route rewrite to reach API Management.

### Triggers
- Branch: `main`
- Paths: `apps/marketing-swa/**` and the pipeline definition itself

### Stage
- **BuildAndDeploy** – Installs Node.js and calls `AzureStaticWebApp@0` to publish the site.

### Required configuration
Create a variable group named **`Practx-Marketing-SWA`** (or define the variables directly on the pipeline) with the following entries:

| Variable | Description |
| --- | --- |
| `PRACTX_MARKETING_SWA__DEPLOYMENT_TOKEN` | Deployment token for the target Static Web App environment. |
| `PRACTX_MARKETING_SWA__APP_LOCATION` | *(Optional)* Path to the frontend source relative to the repo root. Defaults to `apps/marketing-swa/frontend`. |

See [`apps/marketing-swa/VARIABLES.md`](../apps/marketing-swa/VARIABLES.md) for the canonical variable names shared with other deployment guides.

### Notes
- The Static Web App task runs in “skip build” mode because the frontend is plain HTML/CSS/JS. Adjust the task inputs if you later introduce a build step.
- API Management hosts the backend, so `api_location` can remain empty unless you reintroduce Azure Functions in the future.

## Running the pipelines
1. Import each YAML file into Azure DevOps as a new pipeline, pointing to the corresponding path in this repository.
2. Link the appropriate variable group under **Pipeline settings → Variables**.
3. Queue a manual run to test connectivity and confirm that the infrastructure deploys successfully and the Static Web App publishes without errors.

These additions provide a fully supported alternative to the existing GitHub Actions workflow for teams that prefer Azure DevOps for CI/CD.
