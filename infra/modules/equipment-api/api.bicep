param ELM_SERVICE_NAME string
param env string
param location string = resourceGroup().location
param kvName string
param storageAccountName string

var planName = '${ELM_SERVICE_NAME}-plan'
var apimSecretName = 'APIM-BASE-URL-${toLower(env)}'
var insightsSecretName = 'APPINSIGHTS-CONNECTION-STRING-${toLower(env)}'
var contentShareName = toLower('${ELM_SERVICE_NAME}-content')

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' existing = {
  name: storageAccountName
}

var storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, storageAccount.apiVersion).keys[0].value};EndpointSuffix=${environment().suffixes.storage}'

resource appPlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: planName
  location: location
  sku: {
    tier: 'Dynamic'
    name: 'Y1'
  }
  kind: 'functionapp,linux'
  properties: {
    reserved: true
  }
}

resource functionApp 'Microsoft.Web/sites@2022-03-01' = {
  name: ELM_SERVICE_NAME
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    httpsOnly: true
    serverFarmId: appPlan.id
    siteConfig: {
      linuxFxVersion: 'DOTNET-ISOLATED|8.0'
      appSettings: [
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'dotnet-isolated'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'AzureWebJobsStorage'
          value: storageConnectionString
        }
        {
          name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
          value: storageConnectionString
        }
        {
          name: 'WEBSITE_CONTENTSHARE'
          value: contentShareName
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'APIM_BASE_URL'
          value: '@Microsoft.KeyVault(SecretUri=https://${kvName}.vault.azure.net/secrets/${apimSecretName}/)'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: '@Microsoft.KeyVault(SecretUri=https://${kvName}.vault.azure.net/secrets/${insightsSecretName}/)'
        }
      ]
    }
  }
  tags: {
    'practx:env': env
    'practx:component': 'equipment-api'
  }
}

output functionAppPrincipalId string = functionApp.identity.principalId
output functionAppResourceId string = functionApp.id
