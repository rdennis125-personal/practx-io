@description('Azure region where the Static Web App will be deployed.')
param location string = resourceGroup().location

@description('Dev Center environment type (e.g. DEV, QA1, PROD).')
@allowed([
  'DEV'
  'QA1'
  'PROD'
])
param environmentType string

@description('Base name used to generate resource names.')
param baseName string = 'practx'

@description('Git repository URL used by the Static Web App for continuous deployment.')
param repositoryUrl string

@description('Repository branch that should trigger Static Web App deployments.')
param repositoryBranch string = 'main'

@description('Token authorising the Static Web App to access the repository. Optional.')
@secure()
param repositoryToken string = ''

@description('Relative path to the frontend source within the repository.')
param appLocation string = 'frontend'

@description('Relative path to the Azure Functions API source within the repository.')
param apiLocation string = 'api'

@description('Relative path to the build output directory. Leave empty when not applicable.')
param outputLocation string = ''

@description('Whether staging environments are enabled for the Static Web App.')
@allowed([
  'Enabled'
  'Disabled'
])
param stagingEnvironmentPolicy string = 'Enabled'

var namePrefix = toLower('${baseName}-${environmentType}')

module staticWebApp '../../../Practx/infra/modules/staticwebapp.bicep' = {
  name: '${namePrefix}-staticwebapp'
  params: {
    namePrefix: namePrefix
    location: location
    repositoryUrl: repositoryUrl
    repositoryBranch: repositoryBranch
    repositoryToken: repositoryToken
    appLocation: appLocation
    apiLocation: apiLocation
    outputLocation: outputLocation
    stagingEnvironmentPolicy: stagingEnvironmentPolicy
  }
}

output staticWebAppName string = staticWebApp.outputs.staticWebAppName
output staticWebAppDefaultHostname string = staticWebApp.outputs.defaultHostname
output staticWebAppResourceId string = staticWebApp.outputs.resourceId
