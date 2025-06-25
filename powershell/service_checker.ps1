$LogPath = "$PSScriptRoot\service_check.log"
$MaxLogLines = 500

# Define the containers to check (modify as needed)
$containers = @(
    #@{ Name = "pihole"; Url = "http://localhost"; Type = "DNS"; Query = "google.com" },
    @{ Name = "adguard"; Url = "http://localhost"; Type = "DNS"; Query = "google.com" }#,
    #@{ Name = "wg-easy"; Url = "http://localhost:51821" },
    #@{ Name = "unbound"; Type = "DNS"; Query = "google.com" }
)

# Define the Home Assistant VM
$homeAssistantVM = "home assistant"
$homeAssistantUrl = "https://[YOUR HA]"

# Configurable wait time before rechecking accessibility
$retryDelay = 10  # Seconds

# This updates a dynamic dns record of a Namecheap domain.
function Update-DDNS {
	Write-Host "Checking DDNS"
	# Define variables
	$domain = "[your domain].com"
	$record = "[subdomain]"
	$ddnsPassword = "[your password]"

	$updateUrl = "https://dynamicdns.park-your-domain.com/update?host=$record&domain=$domain&password=$ddnsPassword"

	# Optional: Get the current public IP (not necessary for Namecheap, but useful for logging)
	$publicIp = Invoke-RestMethod -Uri "https://dynamicdns.park-your-domain.com/getip"

	# Make the DDNS update request
	$response = Invoke-RestMethod -Uri $updateUrl -Method Get

	# Output the result
	Write-Host "Public IP: $publicIp"
	Write-Host "Namecheap Response:"
	$response
}

# Function to check if Docker is running
function Test-DockerRunning {
	Write-Host "Checking WSL"
	if ((Get-WslDistribution docker-desktop | Select-Object -First 1).State -ne "Running") {
		return false
	}
	
	Write-Host "Checking Docker"
    $dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
    return $dockerProcess -ne $null
}

# Function to restart Docker
function Restart-Docker {
    Write-Log "WARN: Killing Docker"
    Stop-Process -Name "Docker Desktop" -Force
    Stop-Process -Name "com.docker.backend" -Force
    Write-Log "WARN: Restarting Docker..."
    Start-Process -FilePath "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Start-Sleep -Seconds 20  # Give Docker time to start
}

# Function to restart a container
function Restart-Container($containerName) {
    Write-Log "WARN: Restarting container $containerName..."
    docker restart $containerName
    Start-Sleep -Seconds $retryDelay  # Wait for the container to restart
}

# Function to check if a container is running
function Test-ContainerRunning($containerName) {
    $container = docker ps --format "{{.Names}}" | Select-String -Pattern $containerName
    return $container -ne $null
}

# Function to check if the service URL is accessible
function Test-URLAccessible($testUrl) {
    try {
        $response = Invoke-WebRequest -Uri $testUrl -UseBasicParsing -TimeoutSec 5
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Function to check if a DNS container is resolving queries
function Test-DNSContainer($queryDomain) {
    try {
        $dnsResult = Resolve-DnsName -Name $queryDomain -ErrorAction SilentlyContinue
        return $dnsResult -ne $null
    } catch {
        return $false
    }
}

# Function to check if Home Assistant is accessible
function Test-HomeAssistantAccessible {
    return Test-URLAccessible $homeAssistantUrl
}

# Function to restart Home Assistant VM
function Restart-HomeAssistantVM {
    Write-Log "WARN: Restarting Home Assistant VM..."
    Stop-VM -Name $homeAssistantVM -Force
    Start-VM -Name $homeAssistantVM
    Start-Sleep -Seconds $retryDelay  # Wait for VM to boot
}

function Write-Log {
    param(
        [string]$Message
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp`t$Message"
    Add-Content -Path $LogPath -Value $logEntry
    Write-Output $logEntry
}

function Trim-Log {
    if (Test-Path $LogPath) {
        $lines = Get-Content $LogPath
        if ($lines.Count -gt $MaxLogLines) {
            $trimmed = $lines[-$MaxLogLines..-1]
            $trimmed | Set-Content $LogPath
        }
    }
}

Write-Host "Trimming log"
Trim-Log

# Check if Docker is running
if (!(Test-DockerRunning)) {
    Write-Log "Error: Docker is not running. Restarting..."
    Restart-Docker
}

# Verify each container is running and accessible
Write-Host "Checking containers..."
foreach ($container in $containers) {
    $containerName = $container.Name
	Write-Host "Checking $($containerName)"

    if (!(Test-ContainerRunning $containerName)) {
        Write-Log "Error: Container $containerName is not running. Restarting container..."
        Restart-Container $containerName
        break
    }

    $accessible = $true
    if ($container.Type -eq "DNS") {
        $accessible = Test-DNSContainer $container.Query
    }
    if ($container.PSObject.Properties.Name -contains "Url") {
        $accessible = $accessible -and (Test-URLAccessible $container.Url)
    }

    if (!$accessible) {
        Write-Log "Error: Container $containerName is not accessible. Restarting container..."
        Restart-Container $containerName

        if ($container.Type -eq "DNS") {
            $accessible = Test-DNSContainer $container.Query
        }
        if ($container.PSObject.Properties.Name -contains "Url") {
            $accessible = $accessible -and (Test-URLAccessible $container.Url)
        }

        if (!$accessible) {
            Write-Log "Error: Container $containerName is still not accessible. Restarting Docker..."
            Restart-Docker
            break
        }
    }

    Write-Log "Info: Container $containerName is running and accessible."
}

# Check if Home Assistant is accessible
if (!(Test-HomeAssistantAccessible)) {
    Write-Log "Home Assistant is not accessible. Restarting VM..."
    Restart-HomeAssistantVM
} else {
    Write-Log "Home Assistant is running and accessible."
}

Update-DDNS
