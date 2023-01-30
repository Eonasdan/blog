//az deployment group create --resource-group bicep-modules-rg 
//                              --template-file appservice-linux.bicep 
//                              --parameters appServicePlanName='$(var)' sku='B1'

@minLength(5)
@maxLength(40)
@description('Name of the Azure App Service Plan.')
param appServicePlanName string = 'asp-${uniqueString(resourceGroup().id)}'

@description('Provide a location.')
param location string = resourceGroup().location

@description('Provide a tier of your Azure App Service.')
param sku string = 'F1'

resource appServicePlanResource 'Microsoft.Web/serverfarms@2021-03-01' = {
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

@description('Output the farm id')
output farmId string = appServicePlanResource.id
