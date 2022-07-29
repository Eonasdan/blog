param adoConnectorServicePrincipal string
param webAppName string = uniqueString(resourceGroup().id)
param location string = resourceGroup().location

var appServicePlanName = toLower('AppServicePlan-${webAppName}')
var webSiteName = toLower('wapp-${webAppName}')
var kvName = toLower('kv-${webAppName}')


resource appServicePlan_resource 'Microsoft.Web/serverfarms@2021-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'F1'
  }
  properties: {
    reserved: true
  }
  kind: 'linux'
}

resource appService_resource 'Microsoft.Web/sites@2021-03-01' = {
  name: webSiteName
  location: location
  properties: {
    serverFarmId: appServicePlan_resource.id
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|6.0'
    }
  }
  identity: {
    type:'SystemAssigned'
  }
}

resource kv_resource 'Microsoft.KeyVault/vaults@2021-11-01-preview' = {
  name: kvName
  location: location
  properties: {    
    tenantId: subscription().tenantId
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: appService_resource.identity.principalId
        permissions: {
          secrets: [
            'Get'
            'List'
          ]
        }
      }
      {
        tenantId: subscription().tenantId
        objectId: adoConnectorServicePrincipal
        permissions: {
          secrets: [
            'Get'
            'List'
            'Set'
          ]
        }
      }
    ]
    sku: {
      family: 'A'
      name: 'standard'
    }
  }
}

resource webSiteConfig 'Microsoft.Web/sites/config@2021-03-01' = {
  name: 'web'
  parent: appService_resource
  properties: {
    appSettings: [
      { 
       name: 'clientSecret'
       value: '@Microsoft.KeyVault(VaultName=${kvName};SecretName=luggagecombo)'
      }
    ]
  }
}
