@echo off
setlocal enabledelayedexpansion

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Set environment variables
set NODE_ENV=production
set MQTT_PORT=1883
set WEBSOCKET_PORT=8080
set MQTT_HOST=0.0.0.0

:: Change to the project root directory
cd /d "%~dp0\.."

:: Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if !ERRORLEVEL! neq 0 (
        echo Failed to install dependencies
        exit /b 1
    )
)

:: Build TypeScript files
echo Building TypeScript files...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Failed to build TypeScript files
    exit /b 1
)

:: Start the broker
echo Starting MQTT Broker...
node dist/broker/example.js

endlocal
