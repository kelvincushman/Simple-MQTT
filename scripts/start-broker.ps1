# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Found Node.js version: $nodeVersion"
}
catch {
    Write-Host "Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
}

# Set environment variables
$env:NODE_ENV = "production"
$env:MQTT_PORT = "1883"
$env:WEBSOCKET_PORT = "8080"
$env:MQTT_HOST = "0.0.0.0"

# Change to the project root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptPath "..")

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to install dependencies"
            exit 1
        }
    }
    catch {
        Write-Host "Error installing dependencies: $_"
        exit 1
    }
}

# Build TypeScript files
Write-Host "Building TypeScript files..."
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to build TypeScript files"
        exit 1
    }
}
catch {
    Write-Host "Error building TypeScript files: $_"
    exit 1
}

# Start the broker
Write-Host "Starting MQTT Broker..."
try {
    node dist/broker/example.js
}
catch {
    Write-Host "Error starting MQTT broker: $_"
    exit 1
}
