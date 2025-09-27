@description('Azure region where the environment will be deployed.')
param location string = resourceGroup().location

@description('Dev Center environment type (e.g. DEV, QA1, PROD).')
@allowed([
  'DEV'
  'QA1'
  'PROD'
])
param environmentType string

@description('Storage account SKU to provision.')
@allowed([
  'Standard_LRS'
  'Standard_GRS'
  'Standard_RAGRS'
])
param storageAccountSku string = 'Standard_LRS'

@description('Enable the hierarchical namespace for Data Lake Gen2 workloads.')
param enableHierarchicalNamespace bool = false

var storageAccountName = toLower('practx${uniqueString(resourceGroup().id, environmentType)}')

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: storageAccountSku
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowSharedKeyAccess: true
    isHnsEnabled: enableHierarchicalNamespace
  }
  tags: {
    'practx.io:environmentType': environmentType
    'practx.io:managedBy': 'Azure Dev Center'
  }
}

output storageAccountResourceId string = storageAccount.id
output storageAccountName string = storageAccount.name
