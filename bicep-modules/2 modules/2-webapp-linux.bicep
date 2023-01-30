//az deployment group create --resource-group bicep-modules-rg
//                              --template-file webapp-linux.bicep
//                              --parameters farmId=existingAppService 
//                                            webSiteName='$(var)'

@minLength(5)
@maxLength(40)
@description('Name of the Azure Website.')
param webSiteName string = 'wapp-${uniqueString(resourceGroup().id)}'

@description('Provide a location.')
param location string = resourceGroup().location

@description('Provide a Server Farm Id.')
param farmId string

resource appService_resource 'Microsoft.Web/sites@2021-03-01' = {
  name: webSiteName
  location: location
  properties: {
    serverFarmId: farmId
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|6.0'
    }
  }
  identity: {
    type:'SystemAssigned'
  }
}
