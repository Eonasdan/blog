/*
az bicep publish --file "2 modules\1-appservice-linux.bicep" --target br:myACRbicepModuleTest.azurecr.io/bicep/modules/appservice-linux:v1
az bicep publish --file "2 modules\2-webapp-linux.bicep" --target br:myACRbicepModuleTest.azurecr.io/bicep/modules/webapp-linux:v1
*/

param location string = resourceGroup().location

module farm 'br:myACRbicepModuleTest.azurecr.io/bicep/modules/appservice-linux:v1' = {
  name: 'farmDeployment'
  params: {
    appServicePlanName: 'asp-mytestfarmPub'
    location: location
  }
}

module app 'br:myACRbicepModuleTest.azurecr.io/bicep/modules/webapp-linux:v1' = {
  name: 'appDeployment'
  params: {
    farmId: farm.outputs.farmId
    location: location
  }
}
