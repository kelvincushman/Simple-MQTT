#!/bin/bash

# Exit on error
set -e

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Print Node.js version
echo "Found Node.js version: $(node --version)"

# Set environment variables
export NODE_ENV=production
export MQTT_PORT=1883
export WEBSOCKET_PORT=8080
export MQTT_HOST=0.0.0.0

# Change to the project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    if ! npm install; then
        echo "Failed to install dependencies"
        exit 1
    fi
fi

# Build TypeScript files
echo "Building TypeScript files..."
if ! npm run build; then
    echo "Failed to build TypeScript files"
    exit 1
fi

# Start the broker
echo "Starting MQTT Broker..."
exec node dist/broker/example.js
