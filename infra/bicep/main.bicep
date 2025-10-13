param namePrefix string
@allowed([
  'westus2'
])
param location string = 'westus2'
param tags object = {}
param functionSku string = 'Y1'
param tenantId string
param sqlAdminLogin string
@secure()
param sqlAdminPassword string

module insights 'modules/appInsights.bicep' = {
  name: 'appInsights'
  params: {
    name: '${namePrefix}-ai'
    location: location
    tags: tags
  }
}

module serviceBus 'modules/serviceBus.bicep' = {
  name: 'serviceBus'
  params: {
    name: '${namePrefix}-sb'
    location: location
    tags: tags
  }
}

module sql '../modules/sql.bicep' = {
  name: 'sql'
  params: {
    namePrefix: namePrefix
    location: location
    adminLogin: sqlAdminLogin
    adminPassword: sqlAdminPassword
    tags: tags
  }
}

module functionApp 'modules/functionApp.bicep' = {
  name: 'functionApp'
  params: {
    name: '${namePrefix}-func'
    location: location
    planSku: functionSku
    appInsightsConnectionString: insights.outputs.connectionString
    tags: tags
  }
}

module keyVault 'modules/keyVault.bicep' = {
  name: 'keyVault'
  params: {
    name: '${namePrefix}-kv'
    location: location
    tags: tags
    tenantId: tenantId
    functionPrincipalId: functionApp.outputs.principalId
  }
}

output functionAppName string = functionApp.outputs.name
output serviceBusNamespace string = serviceBus.outputs.namespaceName
output keyVaultName string = keyVault.outputs.name
output appInsightsName string = insights.outputs.name
output sqlServerName string = sql.outputs.serverName
output sqlDatabaseName string = sql.outputs.databaseName
output sqlConnectionString string = sql.outputs.connectionString
