# Simple MQTT Broker

A lightweight, feature-rich MQTT broker and client implementation in TypeScript.

## Features

- **MQTT Protocol Support**
  - MQTT 3.1.1 and 5.0 compatibility
  - QoS levels 0, 1, and 2
  - Retained messages
  - Last Will and Testament (LWT)
  - Clean/Persistent Sessions

- **Multiple Storage Options**
  - In-memory storage (default)
  - MongoDB persistence
  - Redis persistence

- **WebSocket Support**
  - MQTT over WebSocket
  - Secure WebSocket (WSS)

- **Security Features**
  - TLS/SSL support
  - Username/Password authentication
  - HTTP-based authentication
  - Client certificate authentication

- **Modern TypeScript Implementation**
  - Full type safety
  - Modern async/await patterns
  - Event-driven architecture
  - Extensive error handling

## Installation

```bash
npm install simple-mqtt-broker
```

## Quick Start

### Start the Broker

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

broker.start()
    .then(() => console.log('Broker started'))
    .catch(console.error);
```

### Connect a Client

```typescript
import { MQTTClient } from 'simple-mqtt-broker';

const client = new MQTTClient({
    brokerUrl: 'mqtt://localhost:1883',
    options: {
        keepalive: 60,
        reconnectPeriod: 1000
    }
});

await client.connect();

// Subscribe to topics
await client.subscribe('test/topic');

// Set up message handler
client.onMessage('test/topic', (topic, message) => {
    console.log(`Received on ${topic}:`, message.toString());
});

// Publish messages
await client.publish('test/topic', 'Hello MQTT!', { qos: 1 });
```

## Configuration

### Broker Configuration

```typescript
interface BrokerConfig {
    mqtt: {
        port: number;
        host: string;
        websocket?: {
            enabled: boolean;
            port: number;
        };
    };
    persistence?: {
        enabled: boolean;
        type: 'memory' | 'redis' | 'mongodb';
        redis?: {
            url: string;
        };
        mongodb?: {
            url: string;
            database: string;
            collection: string;
        };
    };
    auth?: {
        enabled: boolean;
        type: 'basic' | 'http';
        http?: {
            url: string;
            method: string;
            headers?: Record<string, string>;
        };
    };
    tls?: {
        enabled: boolean;
        key: string;
        cert: string;
        ca?: string;
    };
}
```

### Client Configuration

```typescript
interface ClientConfig {
    brokerUrl: string;
    options?: {
        clientId?: string;
        keepalive?: number;
        reconnectPeriod?: number;
        connectTimeout?: number;
        username?: string;
        password?: string;
        clean?: boolean;
        will?: {
            topic: string;
            payload: string;
            qos?: 0 | 1 | 2;
            retain?: boolean;
        };
    };
}
```

## Running the Broker

### Using Scripts

Windows (PowerShell):
```powershell
.\scripts\start-broker.ps1
```

Windows (Command Prompt):
```batch
scripts\start-broker.bat
```

Linux/macOS:
```bash
./scripts/start-broker.sh
```

For more details about running the broker, see the [scripts README](scripts/README.md).

## Storage Options

### In-Memory Storage
```typescript
const broker = new SimpleMQTTBroker({
    persistence: {
        enabled: true,
        type: 'memory'
    }
});
```

### Redis Storage
```typescript
const broker = new SimpleMQTTBroker({
    persistence: {
        enabled: true,
        type: 'redis',
        redis: {
            url: 'redis://localhost:6379'
        }
    }
});
```

### MongoDB Storage
```typescript
const broker = new SimpleMQTTBroker({
    persistence: {
        enabled: true,
        type: 'mongodb',
        mongodb: {
            url: 'mongodb://localhost:27017',
            database: 'mqtt',
            collection: 'messages'
        }
    }
});
```

## Security

### Enable TLS/SSL
```typescript
const broker = new SimpleMQTTBroker({
    tls: {
        enabled: true,
        key: '/path/to/private.key',
        cert: '/path/to/certificate.crt'
    }
});
```

### HTTP Authentication
```typescript
const broker = new SimpleMQTTBroker({
    auth: {
        enabled: true,
        type: 'http',
        http: {
            url: 'https://api.example.com/auth',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer token'
            }
        }
    }
});
```

## Examples

See the [examples](src/modern/examples) directory for more usage examples.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
