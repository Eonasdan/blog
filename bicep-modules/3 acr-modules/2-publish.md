az deployment group create --resource-group bicep-demo-rg --template-file "3 acr-modules\acr.bicep" --parameters acrName=myACRbicepModuleTest acrSku='$(var)'


az bicep publish --file "2 modules\1-appservice-linux.bicep" --target br:myACRbicepModuleTest.azurecr.io/bicep/modules/appservice-linux:v1

az bicep publish --file "2 modules\2-webapp-linux.bicep" --target br:myACRbicepModuleTest.azurecr.io/bicep/modules/webapp-linux:v1