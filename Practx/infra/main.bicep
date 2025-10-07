param env string
param baseName string
@allowed([
  'westus2'
])
param location string = 'westus2'

@secure()
param sqlAdminLogin string
@secure()
param sqlAdminPassword string
@secure()
param stripeSecretKey string
@secure()
param stripePublicKey string
@secure()
param stripeWebhookSecret string
param stripePriceId string
param b2cTenant string
param b2cClientId string
param b2cSignInPolicy string

var namePrefix = '${baseName}-${env}'

module insights 'modules/insights.bicep' = {
  name: '${namePrefix}-insights'
  params: {
    name: '${namePrefix}-appi'
    location: location
  }
}

module storage 'modules/storage.bicep' = {
  name: '${namePrefix}-storage'
  params: {
    name: '${uniqueString(namePrefix, 'storage')}'
    location: location
  }
}

module sql 'modules/sql.bicep' = {
  name: '${namePrefix}-sql'
  params: {
    namePrefix: namePrefix
    location: location
    adminLogin: sqlAdminLogin
    adminPassword: sqlAdminPassword
  }
}

module kv 'modules/keyvault.bicep' = {
  name: '${namePrefix}-kv'
  params: {
    name: replace('${namePrefix}-kv', '-', '')
    location: location
    secrets: {
      SQLCONN: sql.outputs.connectionString
      STRIPE_SECRET_KEY: stripeSecretKey
      STRIPE_PUBLIC_KEY: stripePublicKey
      STRIPE_PRICE_ID: stripePriceId
      STRIPE_WEBHOOK_SECRET: stripeWebhookSecret
      B2C_TENANT: b2cTenant
      B2C_CLIENT_ID: b2cClientId
      B2C_SIGNIN_POLICY: b2cSignInPolicy
      STORAGE_CONNECTION: storage.outputs.connectionString
    }
  }
}

module appService 'modules/appservice.bicep' = {
  name: '${namePrefix}-apps'
  params: {
    namePrefix: namePrefix
    location: location
    keyVaultId: kv.outputs.keyVaultId
    keyVaultName: kv.outputs.keyVaultName
    insightsConnectionString: insights.outputs.connectionString
  }
  dependsOn: [kv]
}

module functions 'modules/functions.bicep' = {
  name: '${namePrefix}-fn'
  params: {
    namePrefix: namePrefix
    location: location
    storageAccountName: storage.outputs.accountName
    appInsightsConnectionString: insights.outputs.connectionString
    keyVaultId: kv.outputs.keyVaultId
    keyVaultName: kv.outputs.keyVaultName
  }
  dependsOn: [kv]
}

module apim 'modules/apim.bicep' = {
  name: '${namePrefix}-apim'
  params: {
    namePrefix: namePrefix
    location: location
    policyContent: loadTextContent('../apim/policies/check-entitlement.xml')
  }
}

output webAppName string = appService.outputs.webAppName
output apiAppName string = appService.outputs.apiAppName
output functionAppName string = functions.outputs.functionAppName
output sqlConnectionString string = sql.outputs.connectionString
output keyVaultUri string = kv.outputs.keyVaultUri
