@description('Name for the container group')
param name string

@description('Location for all resources.')
param location string = resourceGroup().location

@description('Container image to deploy. Should be of the form repoName/imageName:tag for images stored in public Docker Hub, or a fully qualified URI for other registries. Images from private registries require additional registry credentials.')
param image string

@description('An array of ports to open on the container and the IP address. Example: [{ port: int, protocol: \'TCP\' | \'UDP\'}]')
param ports array

@description('The number of CPU cores to allocate to the container.')
param cpuCores int = 1

@description('The amount of memory to allocate to the container in gigabytes.')
param memoryInGb int = 2

@description('The behavior of Azure runtime if container has stopped.')
@allowed([
  'Always'
  'Never'
  'OnFailure'
])
param restartPolicy string = 'OnFailure'

@allowed([
  'Linux'
  'Windows'
])
param osType string

param tagValues object

param environmentVariables array = []
param imageRegistryCredentials array = []

//this this optional but highly recommended
/* 
param logAnalyticsName string
param logAnalyticsResourceGroup string

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' existing = {
  name: logAnalyticsName
  scope: resourceGroup(logAnalyticsResourceGroup)
} */

resource containerGroup 'Microsoft.ContainerInstance/containerGroups@2023-05-01' = {
  name: name
  location: location
  tags: tagValues
  properties: {
    containers: [
      {
        name: name
        properties: {
          image: image
          ports: ports
          resources: {
            requests: {
              cpu: cpuCores
              memoryInGB: memoryInGb
            }
          }
          environmentVariables: environmentVariables
        }
      }
    ]
    imageRegistryCredentials: imageRegistryCredentials
    /* diagnostics: {
      logAnalytics: {
        workspaceId: logAnalytics.properties.customerId
        workspaceKey: logAnalytics.listKeys().primarySharedKey
      }
    } */
    osType: osType
    restartPolicy: restartPolicy
    ipAddress: {
      type: 'Public'
      ports: ports
    }
  }
}

output containerIPv4Address string = containerGroup.properties.ipAddress.ip
