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
