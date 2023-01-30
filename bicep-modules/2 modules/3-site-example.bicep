//az deployment group create --resource-group bicep-modules-rg 
//                               --template-file site-example.bicep

param location string = resourceGroup().location

module farm './1-appservice-linux.bicep' = {
  name: 'farmDeployment'
  params: {
    appServicePlanName: 'asp-mytestfarm'
    location: location
  }
}

module app './2-webapp-linux.bicep' = {
  name: 'appDeployment'
  params: {
    farmId: farm.outputs.farmId
    location: location
  }
}
