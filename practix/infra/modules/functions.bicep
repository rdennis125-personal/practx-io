param namePrefix string
param location string
param storageAccountName string
param appInsightsConnectionString string
param keyVaultId string
param keyVaultName string

var planName = '${namePrefix}-fnplan'
var functionAppName = '${namePrefix}-fn'

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' existing = {
  name: storageAccountName
}

resource plan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: planName
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  kind: 'functionapp'
}

var storageConnection = format('DefaultEndpointsProtocol=https;AccountName={0};AccountKey={1};EndpointSuffix=core.windows.net', storage.name, listKeys(storage.id, storage.apiVersion).keys[0].value)

resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNET-ISOLATED|8.0'
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: storageConnection
        }
        {
          name: 'APPINSIGHTS_CONNECTIONSTRING'
          value: appInsightsConnectionString
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsightsConnectionString
        }
        {
          name: 'SQLCONN'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=SQLCONN)', keyVaultName)
        }
        {
          name: 'STRIPE_SECRET_KEY'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=STRIPE_SECRET_KEY)', keyVaultName)
        }
        {
          name: 'STRIPE_WEBHOOK_SECRET'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=STRIPE_WEBHOOK_SECRET)', keyVaultName)
        }
        {
          name: 'STRIPE_PRICE_ID'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=STRIPE_PRICE_ID)', keyVaultName)
        }
        {
          name: 'STORAGE_CONNECTION'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=STORAGE_CONNECTION)', keyVaultName)
        }
      ]
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

output functionAppName string = functionAppName
output planId string = plan.id
