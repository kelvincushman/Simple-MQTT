import { SimpleMQTTBroker } from '../src';
import { MongoStorage } from '../src';

async function runAdvancedBroker() {
    // Create broker with advanced configuration
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
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        },
        tls: {
            enabled: true,
            key: './certs/server.key',
            cert: './certs/server.crt'
        }
    });

    // Set up event handlers
    broker.on('client.connected', (info) => {
        console.log('Client connected:', info.id);
    });

    broker.on('message.published', (info) => {
        console.log(`Message published on ${info.topic}:`, info.payload.toString());
    });

    broker.on('client.subscribe', (info) => {
        console.log(`Client ${info.clientId} subscribed to:`, info.subscriptions);
    });

    // Start the broker
    try {
        await broker.start();
        console.log('Broker started with advanced configuration');

        // Handle shutdown gracefully
        process.on('SIGINT', async () => {
            console.log('Shutting down...');
            await broker.stop();
            process.exit(0);
        });
    } catch (error) {
        console.error('Failed to start broker:', error);
        process.exit(1);
    }
}

runAdvancedBroker().catch(console.error);
