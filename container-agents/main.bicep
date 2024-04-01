@description('Name for the container group')
param name string

@description('Name of the registry container')
param registry string

@description('Location for all resources.')
param location string = resourceGroup().location

@description('The agent pool this agent belongs to')
param agentPool string

@description('Temporary PAT to connect to ADO')
@secure()
param token string

@description('The user connecting to the container registry. If the task is set to allow access to the pipeline token, this value can be $servicePrincipalId')
param registryUser string

@description('The password for the user connecting to the container registry.If the task is set to allow access to the pipeline token, this value can be $servicePrincipalKey')
@secure()
param registryPassword string

@description('The image the container should use')
param imageName string

@allowed([
  'Linux'
  'Windows'
])
param osType string

//this this optional but highly recommended
/* param logAnalyticsName string
param logAnalyticsResourceGroup string */

param baseTime string = utcNow('d')

module container 'containerGroups.bicep' = {
  name: '${name}-main'
  params: {
    name: name
    location: location
    image: '${registry}.azurecr.io/${imageName}:latest'
    osType: osType
    ports: [
      {
        port: 80
        protocol: 'TCP'
      }
    ]
    /* logAnalyticsName: logAnalyticsName
    logAnalyticsResourceGroup: logAnalyticsResourceGroup */
    tagValues:  {
      LastUpdated: baseTime
    }
    environmentVariables: [
      {
        name:  'AZP_URL'
        value: 'https://dev.azure.com/[REPLACE ME]'
      }
      {
        name:  'AZP_POOL'
        value: agentPool
      }
      {
        name:  'AZP_AGENT_NAME'
        value: name
      }
      {
        name:  'AZP_TOKEN'
        secureValue: token
      }
    ]
    imageRegistryCredentials: [
      {
        server: '${registry}.azurecr.io'
        username: registryUser
        password: registryPassword
      }
    ]
  }
}
