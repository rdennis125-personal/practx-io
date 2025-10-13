param appInsightsName string
param env string
param location string = resourceGroup().location

resource insights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Flow_Type: 'Bluefield'
    IngestionMode: 'ApplicationInsights'
  }
  tags: {
    'practx:env': env
    'practx:component': 'monitoring'
  }
}

output connectionString string = insights.properties.ConnectionString
output instrumentationKey string = insights.properties.InstrumentationKey
