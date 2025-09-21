param name string
param location string
param secrets object

resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: name
  location: location
  properties: {
    tenantId: subscription().tenantId
    enableSoftDelete: true
    enablePurgeProtection: false
    enableRbacAuthorization: true
    sku: {
      family: 'A'
      name: 'standard'
    }
  }
}

resource secretResources 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = [for secretName in union([], keys(secrets)) : {
  name: '${keyVault.name}/${secretName}'
  properties: {
    value: secrets[secretName]
  }
}]

output keyVaultId string = keyVault.id
output keyVaultUri string = keyVault.properties.vaultUri
output keyVaultName string = keyVault.name
