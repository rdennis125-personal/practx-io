@description('Base name prefix applied to the Static Web App resource.')
param namePrefix string

@description('Azure region for the Static Web App.')
param location string

@description('Git repository URL used for the Static Web App source.')
param repositoryUrl string

@description('Git branch connected to the Static Web App.')
param repositoryBranch string

@description('GitHub (or other provider) token that authorises the deployment connection.')
@secure()
param repositoryToken string = ''

@description('Folder containing the frontend assets within the repository.')
param appLocation string = 'frontend'

@description('Folder containing the Azure Functions API within the repository.')
param apiLocation string = 'api'

@description('Build output folder relative to the app location. Leave empty for none.')
param outputLocation string = ''

@description('Controls whether staging environments are enabled for the Static Web App.')
@allowed([
  'Enabled'
  'Disabled'
])
param stagingEnvironmentPolicy string = 'Enabled'

var staticWebAppName = '${namePrefix}-swa'

var staticSiteProperties = union({
    repositoryUrl: repositoryUrl
    branch: repositoryBranch
    buildProperties: {
      appLocation: appLocation
      apiLocation: apiLocation
      outputLocation: outputLocation
    }
    stagingEnvironmentPolicy: stagingEnvironmentPolicy
    allowConfigFileUpdates: true
  }, empty(repositoryToken) ? {} : {
    repositoryToken: repositoryToken
  })

resource staticSite 'Microsoft.Web/staticSites@2022-09-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: staticSiteProperties
}

output staticWebAppName string = staticSite.name
output defaultHostname string = staticSite.properties.defaultHostname
output resourceId string = staticSite.id


--------------------
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
