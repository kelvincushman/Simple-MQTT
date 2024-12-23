# Simple MQTT Broker Startup Scripts

This directory contains startup scripts for running the Simple MQTT Broker on different platforms.

## Windows Scripts

### PowerShell Script (`start-broker.ps1`)
- Run the broker using PowerShell:
  ```powershell
  .\scripts\start-broker.ps1
  ```
- Features:
  - Checks for Node.js installation
  - Automatically installs dependencies
  - Builds TypeScript files
  - Sets up environment variables
  - Provides detailed error messages

### Batch Script (`start-broker.bat`)
- Run the broker using Command Prompt:
  ```batch
  scripts\start-broker.bat
  ```
- Features:
  - Similar to PowerShell script but for cmd.exe
  - Compatible with older Windows versions
  - Automatic dependency management
  - Environment setup

## Unix-like Systems (Linux/macOS)

### Shell Script (`start-broker.sh`)
- Run the broker on Unix-like systems:
  ```bash
  ./scripts/start-broker.sh
  ```
- Features:
  - POSIX-compliant shell script
  - Automatic dependency installation
  - TypeScript compilation
  - Environment variable setup
  - Error handling

### Systemd Service (`mqtt-broker.service`)
- Install and run as a system service on Linux:
  ```bash
  # Copy service file
  sudo cp scripts/mqtt-broker.service /etc/systemd/system/
  
  # Create mqtt user and group
  sudo useradd -r -s /bin/false mqtt
  
  # Create installation directory
  sudo mkdir -p /opt/simple-mqtt
  sudo chown mqtt:mqtt /opt/simple-mqtt
  
  # Copy application files
  sudo cp -r * /opt/simple-mqtt/
  sudo chown -R mqtt:mqtt /opt/simple-mqtt
  
  # Install dependencies and build
  cd /opt/simple-mqtt
  sudo -u mqtt npm install
  sudo -u mqtt npm run build
  
  # Start the service
  sudo systemctl daemon-reload
  sudo systemctl enable mqtt-broker
  sudo systemctl start mqtt-broker
  ```
- Features:
  - Runs as a system service
  - Automatic startup on boot
  - Process monitoring and restart
  - Proper user isolation
  - Log integration with journald

## Environment Variables

All scripts use the following environment variables:
- `NODE_ENV`: Set to "production" by default
- `MQTT_PORT`: MQTT broker port (default: 1883)
- `WEBSOCKET_PORT`: WebSocket port (default: 8080)
- `MQTT_HOST`: Listen address (default: 0.0.0.0)

## Troubleshooting

1. If you see permission errors:
   - Windows: Run as Administrator
   - Unix: Use sudo when needed

2. If Node.js is not found:
   - Install Node.js from https://nodejs.org/
   - Ensure it's in your system PATH

3. If dependencies fail to install:
   - Check your internet connection
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and try again

4. For systemd service issues:
   - Check logs: `sudo journalctl -u mqtt-broker`
   - Verify permissions: `ls -l /opt/simple-mqtt`
   - Check service status: `sudo systemctl status mqtt-broker`
