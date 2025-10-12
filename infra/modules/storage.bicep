@description('Resource group location')
param location string

@description('Globally unique storage account name (<=24, lowercase)')
param storageAccountName string

@description('Blob containers to create')
param containers array = [
  'landing'
  'practice'
  'patient'
  'equipment'
  'service'
]

@description('Tags to apply')
param tags object = {}

resource sa 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  tags: tags
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    accessTier: 'Hot'
  }
}

resource blob 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: sa
  name: 'default'
}

@batchSize(5)
resource containerResources 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = [for c in containers: {
  parent: sa
  name: '/default/${c}'
  properties: { publicAccess: 'None' }
}]

output storageAccountName string = sa.name
output blobEndpoint string = sa.properties.primaryEndpoints.blob
