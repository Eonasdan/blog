//conditional deployment
param deployZone bool

resource dnsZone 'Microsoft.Network/dnszones@2018-05-01' = if (deployZone) {
  name: 'myZone'
  location: 'global'
}
// 
//loops
param moduleCount int = 2

module stgModule './2 modules/2-webapp-linux.bicep' = [for i in range(0, moduleCount): {
  name: '${i}deployModule'
  params: {
    farmId: ''
    location: 'global'
  }
}]

//Parameter decorators
@allowed([
  'Standard_LRS'
  'Standard_GRS'
  'Standard_ZRS'
  'Premium_LRS'
])
param storageSKU string = 'Standard_LRS'
