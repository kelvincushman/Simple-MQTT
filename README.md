# Simple MQTT Broker

A modern, TypeScript-based MQTT broker with support for WebSocket connections, multiple storage backends, and authentication mechanisms.

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
