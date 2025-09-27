@description('Azure region')
param location string = 'eastus'

@description('Environment type tag, e.g., DEV/QA1/PROD')
param environmentType string = 'DEV'

@description('SQL administrator login for the SQL Server instance.')
param sqlAdminLogin string

@description('SQL administrator password for the SQL Server instance.')
@secure()
param sqlAdminPassword string

@description('Stripe secret key stored in the Key Vault.')
@secure()
param stripeSecretKey string

@description('Stripe publishable key stored in the Key Vault.')
param stripePublicKey string

@description('Stripe price identifier stored in the Key Vault.')
param stripePriceId string

@description('Stripe webhook signing secret stored in the Key Vault.')
@secure()
param stripeWebhookSecret string

@description('Entra External ID tenant name stored in the Key Vault.')
param b2cTenant string

@description('Entra External ID client ID stored in the Key Vault.')
param b2cClientId string

@description('Entra External ID sign-in policy stored in the Key Vault.')
param b2cSignInPolicy string

@description('Storage connection string stored in the Key Vault.')
@secure()
param storageConnectionString string

// Modules auto-discovered from Environments/EnvironmentDefinitions/practx-*/main.bicep
module sharedStorage '../EnvironmentDefinitions/practx-shared-storage/main.bicep' = {
  name: 'sharedStorage'
  params: {
    location: location
    environmentType: environmentType
  }
}

module sql '../EnvironmentDefinitions/practx-sql/main.bicep' = {
  name: 'sql'
  params: {
    location: location
    environmentType: environmentType
    sqlAdminLogin: sqlAdminLogin
    sqlAdminPassword: sqlAdminPassword
  }
}

module applicationInsights '../EnvironmentDefinitions/practx-application-insights/main.bicep' = {
  name: 'applicationInsights'
  params: {
    location: location
    environmentType: environmentType
  }
}

module keyvault '../EnvironmentDefinitions/practx-keyvault/main.bicep' = {
  name: 'keyvault'
  params: {
    location: location
    environmentType: environmentType
    sqlConnectionString: sql.outputs.connectionString
    stripeSecretKey: stripeSecretKey
    stripePublicKey: stripePublicKey
    stripePriceId: stripePriceId
    stripeWebhookSecret: stripeWebhookSecret
    b2cTenant: b2cTenant
    b2cClientId: b2cClientId
    b2cSignInPolicy: b2cSignInPolicy
    storageConnectionString: storageConnectionString
  }
}

module functions '../EnvironmentDefinitions/practx-functions/main.bicep' = {
  name: 'functions'
  params: {
    location: location
    environmentType: environmentType
    storageAccountName: sharedStorage.outputs.storageAccountName
    appInsightsConnectionString: applicationInsights.outputs.connectionString
    keyVaultId: keyvault.outputs.keyVaultId
    keyVaultName: keyvault.outputs.keyVaultName
  }
}

module appservice '../EnvironmentDefinitions/practx-appservice/main.bicep' = {
  name: 'appservice'
  params: {
    location: location
    environmentType: environmentType
    keyVaultId: keyvault.outputs.keyVaultId
    keyVaultName: keyvault.outputs.keyVaultName
    appInsightsConnectionString: applicationInsights.outputs.connectionString
  }
}

module apim '../EnvironmentDefinitions/practx-apim/main.bicep' = {
  name: 'apim'
  params: {
    location: location
    environmentType: environmentType
  }
}

output apiManagementName string = apim.outputs.apiManagementName
output applicationInsightsName string = applicationInsights.outputs.applicationInsightsName
output applicationInsightsConnectionString string = applicationInsights.outputs.connectionString
output keyVaultName string = keyvault.outputs.keyVaultName
output keyVaultId string = keyvault.outputs.keyVaultId
output keyVaultUri string = keyvault.outputs.keyVaultUri
output storageAccountName string = sharedStorage.outputs.storageAccountName
output storageAccountResourceId string = sharedStorage.outputs.storageAccountResourceId
output sqlServerName string = sql.outputs.sqlServerName
output sqlDatabaseName string = sql.outputs.databaseName
output sqlConnectionString string = sql.outputs.connectionString
output webAppName string = appservice.outputs.webAppName
output apiAppName string = appservice.outputs.apiAppName
output appServicePlanResourceId string = appservice.outputs.planResourceId
output functionAppName string = functions.outputs.functionAppName
output functionPlanResourceId string = functions.outputs.planResourceId
