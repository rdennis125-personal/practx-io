param swaName string
param env string
param location string = resourceGroup().location

resource staticApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: swaName
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    repositoryToken: ''
    branch: 'main'
    repositoryUrl: 'https://github.com/practx/practx-io'
    buildProperties: {
      apiRuntimeVersion: 'node:18'
      appLocation: 'practx-swa/frontend'
      apiLocation: 'practx-swa/api'
      outputLocation: 'dist'
    }
  }
  tags: {
    'practx:env': env
    'practx:component': 'swa'
  }
}

output defaultHostname string = staticApp.properties.defaultHostname
