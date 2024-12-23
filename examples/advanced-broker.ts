import { SimpleMQTTBroker } from '../src/broker/SimpleMQTTBroker';
import * as path from 'path';

async function runAdvancedBroker() {
    // Create broker with advanced configuration
    const broker = new SimpleMQTTBroker({
        mqtt: {
            port: 1883,
            host: 'localhost',
            websocket: {
                enabled: true,
                port: 8080
            }
        },
        // SSL Configuration
        ssl: {
            enabled: true,
            port: 8883,
            key: path.join(__dirname, 'certs', 'server.key'),
            cert: path.join(__dirname, 'certs', 'server.crt'),
            requestCert: true,
            rejectUnauthorized: true
        },
        // Authentication Configuration
        auth: {
            type: 'file',
            allowAnonymous: false,
            allowZeroByteClientId: false,
            config: {
                filePath: path.join(__dirname, 'config', 'users.json')
            }
        },
        // Persistence Configuration
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

    // Set up event handlers
    broker.on('broker.started', (info) => {
        console.log(`MQTT Broker started on ${info.host}:${info.port}`);
        if (info.ssl) {
            console.log(`SSL enabled on port ${info.ssl.port}`);
        }
    });

    broker.on('client.connected', (info) => {
        console.log(`Client connected: ${info.id}`);
        console.log(`Authentication method: ${info.auth?.method}`);
    });

    broker.on('client.disconnected', (info) => {
        console.log(`Client disconnected: ${info.id}`);
    });

    broker.on('message.published', async (info) => {
        console.log(`Message published on ${info.topic} by ${info.clientId || 'anonymous'}`);
        console.log(`Payload: ${info.payload.toString()}`);
        
        // Example: Retrieve stored messages
        const storage = broker.getStorage();
        const messages = await storage.getMessages(info.topic);
        console.log(`Total messages in topic: ${messages.length}`);
    });

    broker.on('client.error', (error) => {
        console.error('Client error:', error);
    });

    // Start the broker
    try {
        await broker.start();
        console.log('Advanced MQTT Broker is running');

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
