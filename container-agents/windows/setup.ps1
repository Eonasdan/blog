[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host "Installing Git"
choco install git

# Install the latest version of .NET 6 SDK. 8 is already included in the base image
# If you need other version, install them in order, e.g. 5, 6, 7
Write-Host "Installing dotnet"
choco install dotnet-sdk --version=6.0.412

Write-Host "Installing Azure CLI"
choco install azure-cli

Write-Host "Updating Azure CLI to auto upgrade..."
az config set auto-upgrade.enable=yes
az config set auto-upgrade.prompt=no

choco install bicep

Write-Host "Installing AZ PS modules..."
Install-Module -Name Az -Repository PSGallery -Force

Write-Host "Installing SQL Tools..."
Invoke-WebRequest -Uri https://aka.ms/dacfx-msi -OutFile C:\tools\sqlpackage.msi
msiexec /i C:\tools\sqlpackage.msi /quiet

Write-Host "Installing SQL PS module..."
Install-Module -Name SqlServer -Repository PSGallery -Force

# Download Terraform
Write-Host "Downloading Terraform..."
choco install terraform