# Simple MQTT Broker

A modern, TypeScript-based MQTT broker with support for WebSocket connections, multiple storage backends, and authentication mechanisms, Developed by Kelvin Lee for his Aitent project to provide a lightweight modern solution. 

## Features

- 🚀 Modern TypeScript implementation
- 🔌 TCP and WebSocket support
- 💾 Multiple storage backends (Memory, Redis, MongoDB)
- 🔒 Authentication support (HTTP, Basic)
- 📝 Comprehensive logging and error handling
- 🔄 QoS support (0, 1, 2)
- 🔐 TLS/SSL support
- 📦 Easy to use API

## Installation

```bash
npm install simple-mqtt-broker
```

## Quick Start

### Basic Broker

```typescript
import { SimpleMQTTBroker } from 'simple-mqtt-broker';

const broker = new SimpleMQTTBroker({
    mqtt: {
        port: 1883,
        host: '0.0.0.0',
        websocket: {
            enabled: true,
            port: 8080
        }
    }
});

broker.on('client.connected', (info) => {
    console.log('Client connected:', info.id);
});

broker.start()
    .then(() => console.log('Broker started'))
    .catch(console.error);
```

### Basic Client

```typescript
import { MQTTClient } from 'simple-mqtt-broker';

const client = new MQTTClient({
    brokerUrl: 'mqtt://localhost:1883',
    options: {
        clientId: 'test-client',
        keepalive: 60
    }
});

async function run() {
    await client.connect();
    console.log('Connected to broker');

    await client.subscribe('test/topic');
    console.log('Subscribed to test/topic');

    client.onMessage('test/topic', (topic, message) => {
        console.log(`Received message on ${topic}:`, message.toString());
    });

    await client.publish('test/topic', 'Hello MQTT!');
    console.log('Published message');
}

run().catch(console.error);
```

## Advanced Configuration

### Broker with MongoDB Storage and HTTP Authentication

```typescript
const broker = new SimpleMQTTBroker({
    mqtt: {
        port: 1883,
        host: '0.0.0.0',
        websocket: {
            enabled: true,
            port: 8080
        }
    },
    persistence: {
        enabled: true,
        type: 'mongodb',
        mongodb: {
            url: 'mongodb://localhost:27017',
            database: 'mqtt',
            collection: 'messages'
        }
    },
    auth: {
        enabled: true,
        type: 'http',
        http: {
            url: 'http://localhost:3000/auth',
            method: 'POST'
        }
    }
});
```

### SSL/TLS Configuration

```typescript
const broker = new SimpleMQTTBroker({
    mqtt: {
        port: 8883,
        host: '0.0.0.0'
    },
    tls: {
        enabled: true,
        key: '/path/to/server.key',
        cert: '/path/to/server.crt'
    }
});
```

## Docker Support

### Using Docker Compose

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Simple-MQTT.git
cd Simple-MQTT
```

2. Build and run using Docker Compose:
```bash
cd docker/SimpleMQTT
docker-compose up --build
```

This will:
- Build the TypeScript code
- Create a Docker container
- Start the MQTT broker on port 1883
- Start the WebSocket server on port 8080
- Serve the test client at http://localhost:8000/test-client.html

### Manual Docker Build

If you prefer to build and run the container manually:

1. Build the image:
```bash
docker build -t simple-mqtt -f docker/SimpleMQTT/Dockerfile .
```

2. Run the container:
```bash
docker run -p 1883:1883 -p 8080:8080 -p 8000:8000 simple-mqtt
```

### Environment Variables

The Docker container supports the following environment variables:

- `MQTT_PORT`: MQTT broker port (default: 1883)
- `MQTT_HOST`: MQTT broker host (default: 0.0.0.0)
- `WS_PORT`: WebSocket port (default: 8080)
- `HTTP_PORT`: HTTP server port for test client (default: 8000)

Example with custom ports:
```bash
docker run -e MQTT_PORT=1884 -e WS_PORT=8081 -p 1884:1884 -p 8081:8081 simple-mqtt
```

### Docker Compose Configuration

The default `docker-compose.yml` includes:
- MQTT broker service
- Exposed ports for MQTT, WebSocket, and HTTP
- Volume mapping for development
- Auto-restart on failure

You can customize the configuration by editing `docker/SimpleMQTT/docker-compose.yml`.

## API Documentation

### SimpleMQTTBroker

The main broker class that handles MQTT connections and message routing.

#### Events

- `client.connected`: Emitted when a client connects
- `client.disconnected`: Emitted when a client disconnects
- `message.published`: Emitted when a message is published
- `client.subscribe`: Emitted when a client subscribes to a topic
- `broker.error`: Emitted when an error occurs

### MQTTClient

A client class for connecting to MQTT brokers.

#### Methods

- `connect()`: Connect to the broker
- `disconnect()`: Disconnect from the broker
- `publish(topic, message, options?)`: Publish a message
- `subscribe(topic, options?)`: Subscribe to a topic
- `unsubscribe(topic)`: Unsubscribe from a topic
- `onMessage(topic, handler)`: Add a message handler
- `removeMessageHandler(topic, handler)`: Remove a message handler
- `isConnected()`: Check connection status

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
