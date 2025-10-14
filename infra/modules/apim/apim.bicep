param apimName string
param env string
param publisherEmail string
param publisherName string
param location string = resourceGroup().location

resource apim 'Microsoft.ApiManagement/service@2023-05-01-preview' = {
  name: apimName
  location: location
  sku: {
    name: 'Developer'
    capacity: 1
  }
  properties: {
    publisherEmail: publisherEmail
    publisherName: publisherName
    virtualNetworkType: 'None'
  }
  tags: {
    'practx:env': env
    'practx:component': 'apim'
  }
}

resource products 'Microsoft.ApiManagement/service/products@2023-05-01-preview' = {
  name: '${apim.name}/practx-platform'
  properties: {
    displayName: 'Practx Platform'
    description: 'Platform APIs available to authenticated clients.'
    subscriptionRequired: true
    approvalRequired: true
    state: 'published'
  }
  dependsOn: [
    apim
  ]
}

resource namedValue 'Microsoft.ApiManagement/service/namedValues@2023-05-01-preview' = {
  name: '${apim.name}/appinsights-connection-string'
  properties: {
    displayName: 'ApplicationInsightsConnectionString'
    value: 'keyvault://appinsights-connection-string'
    secret: true
    tags: [
      env
    ]
  }
}

resource versionSet 'Microsoft.ApiManagement/service/apiVersionSets@2023-05-01-preview' = {
  name: '${apim.name}/practx-version-set'
  properties: {
    displayName: 'Practx APIs'
    versioningScheme: 'Segment'
  }
}

resource logger 'Microsoft.ApiManagement/service/loggers@2023-05-01-preview' = {
  name: '${apim.name}/appinsights'
  properties: {
    loggerType: 'applicationInsights'
    credentials: {
      instrumentationKey: 'keyvault://appinsights-instrumentation-key'
    }
  }
}

output apimId string = apim.id
