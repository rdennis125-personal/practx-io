param name string
param location string
@secure()
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

resource secretResources 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = [for secret in items(secrets) : {
  name: '${keyVault.name}/${secret.key}'
  properties: {
    value: secret.value
  }
}]

output keyVaultId string = keyVault.id
output keyVaultUri string = keyVault.properties.vaultUri
output keyVaultName string = keyVault.name
