import { SimpleMQTTBroker } from './SimpleMQTTBroker';

async function main() {
    // Create broker instance with custom configuration
    const broker = new SimpleMQTTBroker({
        mqtt: {
            port: 1883,
            host: 'localhost',
            websocket: {
                enabled: true,
                port: 8080
            }
        },
        auth: {
            type: 'none',
            allowAnonymous: true,
            allowZeroByteClientId: false
        },
        persistence: {
            enabled: true,
            type: 'memory'
        }
    });

    // Set up event listeners
    broker.on('broker.started', (info) => {
        console.log(`Broker started on ${info.host}:${info.port}`);
    });

    broker.on('websocket.started', (info) => {
        console.log(`WebSocket server started on port ${info.port}`);
    });

    broker.on('client.connected', (info) => {
        console.log(`Client connected: ${info.id}`);
    });

    broker.on('client.disconnected', (info) => {
        console.log(`Client disconnected: ${info.id}`);
    });

    broker.on('message.published', (info) => {
        console.log(`Message published on ${info.topic} by ${info.clientId || 'anonymous'}`);
        console.log(`Payload: ${info.payload.toString()}`);
    });

    // Start the broker
    try {
        await broker.start();
        console.log('MQTT Broker is running');

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

main().catch(console.error);
