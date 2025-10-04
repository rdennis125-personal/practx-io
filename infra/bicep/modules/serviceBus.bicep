param name string
param location string
param tags object = {}

resource namespace 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
}

resource topic 'Microsoft.ServiceBus/namespaces/topics@2022-10-01-preview' = {
  parent: namespace
  name: 'payments'
  properties: {
    defaultMessageTimeToLive: 'P14D'
  }
}

@batchSize(1)
@minLength(1)
var subscriptions = [
  'dealer'
  'resolve'
  'settlements'
]

resource subs 'Microsoft.ServiceBus/namespaces/topics/subscriptions@2022-10-01-preview' = [for subName in subscriptions: {
  parent: topic
  name: subName
  properties: {
    defaultMessageTimeToLive: 'P14D'
  }
}]

output namespaceName string = namespace.name
