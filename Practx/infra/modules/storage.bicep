param name string
param location string

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: name
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    isHnsEnabled: true
    accessTier: 'Hot'
    allowBlobPublicAccess: false
  }
}

var keys = listKeys(storage.id, storage.apiVersion)
var primaryKey = keys.keys[0].value

output accountName string = storage.name
output connectionString string = format('DefaultEndpointsProtocol=https;AccountName={0};AccountKey={1};EndpointSuffix=core.windows.net', storage.name, primaryKey)
