# Practx Marketing Static Web App

Production-ready starter for the Practx marketing site running on Azure Static Web Apps (Free tier) with Azure API Management handling all backend traffic.

## Features

- Vanilla HTML/CSS/JS landing pages for Practx offerings (hygiene, outreach, franchise)
- Accessible, mobile-first design with shared navigation and footer
- Signup form with client-side validation and honeypot field
- Azure API Management gateway routing `/api/*` calls to the practx platform
- GitHub Actions workflow for CI/CD to Azure Static Web Apps
- SEO basics: titles, descriptions, Open Graph, robots.txt, sitemap

## Prerequisites

- Azure subscription with permissions to create resources
- GitHub repository with access to configure secrets
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) (2.49+)
- Node.js 18 LTS

## Getting Started Locally

1. Clone the repository and install frontend dependencies (none required for production, optional for tooling updates).

2. Serve the frontend with any static web server, or install the [Static Web Apps CLI](https://learn.microsoft.com/azure/static-web-apps/local-development) to exercise the API Management rewrite locally.

   ```bash
   npx @azure/static-web-apps-cli start ./frontend --swa-config ../staticwebapp.config.json
   ```

   The CLI honours `staticwebapp.config.json` and proxies `/api/*` requests to the practx API Management gateway.

3. Update `window.PRACTX_MARKETING_SWA__API_BASE_URL` in a boot script if you need to target a non-production API endpoint. The default configuration points at the production gateway (`https://practx-prod-apim.azure-api.net/practx`). For example:

   ```html
   <script>
    window.PRACTX_MARKETING_SWA__API_BASE_URL = 'https://practx-dev-apim.azure-api.net/practx';
   </script>
   <script defer src="signup.js"></script>
   ```

## Deployment

### GitHub Actions

A workflow at `../.github/workflows/azure-static-web-apps.yml` deploys the app whenever changes are pushed to the `main` branch. The workflow expects a repository secret named `AZURE_STATIC_WEB_APPS_API_TOKEN_MANGO_HILL_0CB59961E` generated from the Azure portal for the Static Web App.

### Azure DevOps Pipelines

An alternative Azure DevOps pipeline definition is available at `pipelines/marketing-swa-azure-pipelines.yml`. Import it into Azure DevOps and link a variable group containing `PRACTX_MARKETING_SWA__DEPLOYMENT_TOKEN` (the deployment token) along with any optional `PRACTX_MARKETING_SWA__APP_LOCATION` override. See [Azure DevOps Pipelines for Practx](../docs/azure-devops-pipelines.md) for detailed setup steps and reference [`VARIABLES.md`](VARIABLES.md) for the canonical names.

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
  --app-location "apps/marketing-swa/frontend" \
  --output-location ""

# After creation, add the Practx API Management rewrite contained in apps/marketing-swa/staticwebapp.config.json if you created the resource manually.
```

### Domain Configuration

1. In the Azure portal, open your Static Web App and add custom domains `practx.io` and `www.practx.io`.
2. Create CNAME DNS records pointing `www` to the SWA default hostname and an ALIAS/ANAME or CNAME (if supported) for the apex `practx.io`.
3. Azure Static Web Apps will validate ownership and automatically issue TLS certificates.

## Project Structure

```
apps/
  marketing-swa/
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
  README.md
  LICENSE
```

## API Management Integration

`staticwebapp.config.json` rewrites all `/api/*` traffic to `https://practx-prod-apim.azure-api.net/practx/{rest}`. The marketing experience forwards an anonymised entitlement hash (`x-practx-entitlement`) with every request so API Management can enforce downstream policies without exposing platform secrets in the browser. Update the rewrite target if you onboard additional environments.

## License

MIT License. See [LICENSE](LICENSE) for details.
