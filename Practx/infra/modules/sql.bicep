param namePrefix string
param location string
param adminLogin string
@secure()
param adminPassword string

var sqlServerName = toLower('${namePrefix}-sqlsrv')
var databaseName = '${namePrefix}-db'

resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: adminLogin
    administratorLoginPassword: adminPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

resource database 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  name: '${sqlServer.name}/${databaseName}'
  location: location
  sku: {
    name: 'GP_S_Gen5_1'
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 1
  }
  properties: {
    autoPauseDelay: 60
    maxSizeBytes: 53687091200
    zoneRedundant: false
  }
}

output serverName string = sqlServer.name
output databaseName string = database.name
output connectionString string = format('Server=tcp:{0}.database.windows.net,1433;Initial Catalog={1};Persist Security Info=False;User ID={2};Password={3};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;', sqlServer.name, databaseName, adminLogin, adminPassword)
