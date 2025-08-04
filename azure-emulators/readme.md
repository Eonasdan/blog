# env

Make sure that the values for `CONFIG_PATH` and `AZURITE_DATA_PATH` are valid.

# Azurite / Storage

https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage

# Service Bus

https://learn.microsoft.com/en-us/azure/service-bus-messaging/test-locally-with-service-bus-emulator?tabs=docker-linux-container

Note that the `sqledge` container is a dependency.

# Cosmos
https://learn.microsoft.com/en-us/azure/cosmos-db/how-to-develop-emulator?tabs=docker-windows%2Ccsharp&pivots=api-nosql

Get the cert if you need to trust it.
```powershell
$parameters = @{
Uri = 'https://localhost:8081/_explorer/emulator.pem'
Method = 'GET'
OutFile = 'emulatorcert.crt'
SkipCertificateCheck = $True
}
Invoke-WebRequest @parameters
```

# ADX
https://learn.microsoft.com/en-us/azure/data-explorer/kusto-emulator-install
