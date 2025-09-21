param namePrefix string
param location string
param policyContent string

var apimName = replace('${namePrefix}-apim', '-', '')

resource apim 'Microsoft.ApiManagement/service@2022-08-01' = {
  name: apimName
  location: location
  sku: {
    name: 'Developer'
    capacity: 1
  }
  properties: {
    publisherEmail: 'admin@practx.io'
    publisherName: 'Practx'
  }
}

resource api 'Microsoft.ApiManagement/service/apis@2022-08-01' = {
  name: '${apim.name}/practx-api'
  properties: {
    displayName: 'Practx API'
    path: 'api'
    protocols: [
      'https'
    ]
  }
}

resource policy 'Microsoft.ApiManagement/service/apis/policies@2022-08-01' = {
  name: '${api.name}/policy'
  properties: {
    format: 'xml'
    value: policyContent
  }
}

output apimName string = apim.name
