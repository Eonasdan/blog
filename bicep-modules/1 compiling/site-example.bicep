param location string = resourceGroup().location

@description('Name of the Azure App Service Plan.')
@minLength(5)
@maxLength(40)
param appServicePlanName string = 'asp-${uniqueString(resourceGroup().id)}'

@description('Provide a tier of your Azure App Service.')
param sku string = 'F1'

@description('Name of the Azure Website.')
@minLength(5)
@maxLength(40)
param webSiteName string = 'wapp-${uniqueString(resourceGroup().id)}'

resource appServicePlan 'Microsoft.Web/serverfarms@2021-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: sku
  }
  properties: {
    reserved: true
  }
  kind: 'linux'
}

resource webSite 'Microsoft.Web/sites@2021-03-01' = {
  name: webSiteName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|6.0'
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}
