# SimpleMQTT Docker Container

This container runs the SimpleMQTT broker with a web-based test client.

## Ports

- 1883: MQTT TCP port
- 8080: MQTT WebSocket port
- 8000: HTTP port (for test client)

## How to Run

1. Build and start the container:
   ```bash
   docker-compose up --build
   ```

2. Access the test client:
   Open your web browser and navigate to `http://localhost:8000/test-client.html`

## Testing the MQTT Broker

1. Connect to the broker using the web client
2. Subscribe to a topic (e.g., "test/#")
3. Publish messages to see them being received

## Container Structure

- The broker runs on port 1883 (TCP) and 8080 (WebSocket)
- A simple HTTP server runs on port 8000 to serve the test client
- Source code is mounted as a volume for easy development
