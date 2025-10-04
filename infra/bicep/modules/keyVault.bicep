param name string
param location string
param tags object = {}
param tenantId string
param functionPrincipalId string
param secrets object = {
  STRIPE_TEST_KEY: 'placeholder'
  RESOLVE_TEST_KEY: 'placeholder'
  SERVICE_BUS_CONNECTION: 'Endpoint=sb://example/;SharedAccessKeyName=Root;SharedAccessKey=replace'
}

resource vault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    tenantId: tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: [
      {
        tenantId: tenantId
        objectId: functionPrincipalId
        permissions: {
          secrets: [ 'get', 'list' ]
        }
      }
    ]
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: true
  }
}

resource secretResources 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = [for secretName in union([], keys(secrets)): {
  name: '${vault.name}/${secretName}'
  properties: {
    value: secrets[secretName]
  }
}]

output name string = vault.name
output vaultUri string = vault.properties.vaultUri
