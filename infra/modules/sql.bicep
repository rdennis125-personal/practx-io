@description('Base prefix applied to the SQL server and database names.')
param namePrefix string

@description('Azure region for the SQL resources.')
param location string

@description('Administrator login for the SQL logical server.')
param adminLogin string

@description('Administrator password for the SQL logical server.')
@secure()
param adminPassword string

@description('Optional resource tags to apply to the SQL resources.')
param tags object = {}

var serverName = toLower('${namePrefix}-sql')
var databaseName = toLower('${namePrefix}-core')

resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: serverName
  location: location
  tags: tags
  properties: {
    administratorLogin: adminLogin
    administratorLoginPassword: adminPassword
    publicNetworkAccess: 'Enabled'
    minimalTlsVersion: '1.2'
  }
}

resource allowAzure 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  name: 'AllowAzureServices'
  parent: sqlServer
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource database 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  name: databaseName
  parent: sqlServer
  location: location
  sku: {
    name: 'GP_S_Gen5_1'
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 1
  }
  properties: {
    createMode: 'Default'
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 268435456000
    autoPauseDelay: 60
    minCapacity: 0.5
    requestedServiceObjectiveName: 'GP_S_Gen5_1'
    zoneRedundant: false
    computeModel: 'Serverless'
  }
}

output serverName string = sqlServer.name
output databaseName string = database.name
output fullyQualifiedDomainName string = sqlServer.properties.fullyQualifiedDomainName
output connectionString string = 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${database.name};Persist Security Info=False;User ID=${adminLogin};Password=${adminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
