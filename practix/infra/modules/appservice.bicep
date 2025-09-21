param namePrefix string
param location string
param keyVaultId string
param keyVaultName string
param insightsConnectionString string

var planName = '${namePrefix}-plan'
var webAppName = '${namePrefix}-web'
var apiAppName = '${namePrefix}-api'

resource plan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: planName
  location: location
  sku: {
    name: 'P1v3'
    tier: 'PremiumV3'
    capacity: 1
  }
  kind: 'app'
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2022-09-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      appSettings: [
        {
          name: 'APPINSIGHTS_CONNECTIONSTRING'
          value: insightsConnectionString
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: insightsConnectionString
        }
        {
          name: 'NEXT_PUBLIC_B2C_TENANT'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=B2C_TENANT)', keyVaultName)
        }
        {
          name: 'NEXT_PUBLIC_B2C_CLIENT_ID'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=B2C_CLIENT_ID)', keyVaultName)
        }
        {
          name: 'NEXT_PUBLIC_B2C_SIGNIN_POLICY'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=B2C_SIGNIN_POLICY)', keyVaultName)
        }
        {
          name: 'NEXT_PUBLIC_API_BASE'
          value: format('https://{0}.azurewebsites.net', apiAppName)
        }
        {
          name: 'NEXT_PUBLIC_B2C_REDIRECT_URI'
          value: format('https://{0}.azurewebsites.net/app', webAppName)
        }
      ]
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

resource apiApp 'Microsoft.Web/sites@2022-09-01' = {
  name: apiAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNET|8.0'
      appSettings: [
        {
          name: 'APPINSIGHTS_CONNECTIONSTRING'
          value: insightsConnectionString
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: insightsConnectionString
        }
        {
          name: 'SQLCONN'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=SQLCONN)', keyVaultName)
        }
        {
          name: 'STRIPE_PUBLIC_KEY'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=STRIPE_PUBLIC_KEY)', keyVaultName)
        }
        {
          name: 'STRIPE_SECRET_KEY'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=STRIPE_SECRET_KEY)', keyVaultName)
        }
        {
          name: 'STRIPE_PRICE_ID'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=STRIPE_PRICE_ID)', keyVaultName)
        }
        {
          name: 'B2C_TENANT'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=B2C_TENANT)', keyVaultName)
        }
        {
          name: 'B2C_CLIENT_ID'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=B2C_CLIENT_ID)', keyVaultName)
        }
        {
          name: 'B2C_SIGNIN_POLICY'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=B2C_SIGNIN_POLICY)', keyVaultName)
        }
      ]
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

output webAppName string = webAppName
output apiAppName string = apiAppName
output planId string = plan.id
