@description('Resource group location')
param location string

@description('Prefix used to derive resource names (e.g. practx-dev)')
param namePrefix string

@description('Tags to apply to the API Management resources')
param tags object = {}

@description('Publisher name displayed in the developer portal')
param publisherName string = 'Practx.io'

@description('Contact email address surfaced in the developer portal')
param publisherEmail string = 'support@practx.io'

@description('API Management SKU name (Developer only supported)')
@allowed([
  'Developer'
])
param skuName string = 'Developer'

@description('Capacity for the API Management SKU (Developer supports only 1 unit)')
@minValue(1)
@maxValue(1)
param skuCapacity int = 1

@description('Raw XML policy applied at the global scope. Leave blank to use the default entitlement policy.')
param policyContent string = ''

@description('Create the default Practx product that enforces subscriptions')
param createDefaultProduct bool = true

@description('Create a placeholder API that can be wired to downstream services later')
param createDefaultApi bool = false

@description('Display name for the default API (when enabled)')
param defaultApiDisplayName string = 'Practx API'

@description('Internal name for the default API (when enabled)')
param defaultApiName string = 'practx-api'

@description('Public path segment exposed by the default API (when enabled)')
param defaultApiPath string = 'practx'

@description('Backend service URL proxied by the default API (when enabled)')
param defaultApiServiceUrl string = 'https://example.com'

var basePolicy = '''
<policies>
  <inbound>
    <base />
  </inbound>
  <backend>
    <base />
  </backend>
  <outbound>
    <base />
  </outbound>
  <on-error>
    <base />
  </on-error>
</policies>
'''

var normalizedPrefix = toLower(replace(namePrefix, '_', '-'))
var rawServiceName = '${normalizedPrefix}-apim'
var serviceName = substring(rawServiceName, 0, min(50, length(rawServiceName)))
var effectivePolicy = empty(trim(policyContent)) ? basePolicy : policyContent
var productName = '${normalizedPrefix}-core'
var shouldCreateApi = createDefaultApi && !empty(trim(defaultApiServiceUrl))

resource apim 'Microsoft.ApiManagement/service@2022-08-01' = {
  name: serviceName
  location: location
  sku: {
    name: skuName
    capacity: skuCapacity
  }
  tags: tags
  properties: {
    publisherEmail: publisherEmail
    publisherName: publisherName
  }
}

resource apimPolicy 'Microsoft.ApiManagement/service/policies@2022-08-01' = {
  parent: apim
  name: 'policy'
  properties: {
    value: effectivePolicy
    format: 'rawxml'
  }
}

resource product 'Microsoft.ApiManagement/service/products@2022-08-01' = if (createDefaultProduct) {
  parent: apim
  name: productName
  properties: {
    displayName: 'Practx Core'
    description: 'Default product for Practx APIs. Requires a subscription key.'
    subscriptionRequired: true
    approvalRequired: false
    subscriptionsLimit: 1000
    state: 'published'
  }
}

resource api 'Microsoft.ApiManagement/service/apis@2022-08-01' = if (shouldCreateApi) {
  parent: apim
  name: defaultApiName
  properties: {
    displayName: defaultApiDisplayName
    path: defaultApiPath
    apiType: 'http'
    protocols: [
      'https'
    ]
    subscriptionRequired: true
    serviceUrl: defaultApiServiceUrl
  }
}

resource apiPolicy 'Microsoft.ApiManagement/service/apis/policies@2022-08-01' = if (shouldCreateApi) {
  parent: api
  name: 'policy'
  properties: {
    value: effectivePolicy
    format: 'rawxml'
  }
}

resource productApi 'Microsoft.ApiManagement/service/products/apis@2022-08-01' = if (shouldCreateApi && createDefaultProduct) {
  parent: product
  name: api.name
  properties: {}
}

output apimName string = apim.name
output apimResourceId string = apim.id
output gatewayUrl string = apim.properties.gatewayUrl
output developerPortalUrl string = apim.properties.developerPortalUrl
output managementApiUrl string = apim.properties.managementApiUrl
