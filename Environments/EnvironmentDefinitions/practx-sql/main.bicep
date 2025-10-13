@description('Azure region where the environment will be deployed.')
param location string = resourceGroup().location

@description('Dev Center environment type (e.g. DEV, QA1, PROD).')
@allowed([
  'DEV'
  'QA1'
  'PROD'
])
param environmentType string

@description('Base name used to build resource names.')
param baseName string = 'practx'

@description('Administrator login for the SQL Server instance.')
param sqlAdminLogin string

@description('Administrator password for the SQL Server instance.')
@secure()
param sqlAdminPassword string

var namePrefix = toLower('${baseName}-${environmentType}')

module sql '../../../infra/modules/sql.bicep' = {
  name: '${namePrefix}-sql'
  params: {
    namePrefix: namePrefix
    location: location
    adminLogin: sqlAdminLogin
    adminPassword: sqlAdminPassword
  }
}

output sqlServerName string = sql.outputs.serverName
output databaseName string = sql.outputs.databaseName
output connectionString string = sql.outputs.connectionString
