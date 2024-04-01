@description('Location for all resources.')
param location string = resourceGroup().location

@description('The user connecting to the container registry. If the task is set to allow access to the pipeline token, this value can be $env:servicePrincipalId')
param registryUser string

@description('The password for the user connecting to the container registry. If the task is set to allow access to the pipeline token, this value can be $env:servicePrincipalKey')
@secure()
param registryPassword string

@description('Temporary PAT to connect to ADO')
@secure()
param token string

@description('Instance count. Defaults to 01')
param instance string = '01'

var name = 'ci-agent-linux-dev-${location}-${instance}'

module container 'main.bicep' = {
    name: '${name}-ci'
    params: {
        location: location
        agentPool: '[Replace Me]'
        name: name
        imageName: 'linux-agents'
        osType: 'Linux'
        registry: '[Replace Me]'
        registryPassword: registryPassword
        registryUser: registryUser
        token: token
        /* logAnalyticsName: 'log-dev-${location}'
        logAnalyticsResourceGroup: 'rg-log-dev' */
    }
}
