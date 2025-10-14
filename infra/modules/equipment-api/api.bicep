param appName string
param env string
param location string = resourceGroup().location
param kvName string

var planName = '${appName}-plan'
var apimSecretName = 'APIM-BASE-URL-${toLower(env)}'
var insightsSecretName = 'APPINSIGHTS-CONNECTION-STRING-${toLower(env)}'

resource appPlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: planName
  location: location
  sku: {
    tier: 'PremiumV3'
    name: 'P1v3'
    size: 'P1v3'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: appName
  location: location
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    httpsOnly: true
    serverFarmId: appPlan.id
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|8.0'
      appSettings: [
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: toUpper(env)
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

output webAppPrincipalId string = webApp.identity.principalId
output webAppResourceId string = webApp.id
