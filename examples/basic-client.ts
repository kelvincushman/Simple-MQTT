import { MQTTClient } from '../src';

async function runBasicClient() {
    const client = new MQTTClient({
        brokerUrl: 'mqtt://localhost:1883',
        options: {
            clientId: 'basic-client',
            keepalive: 60,
            reconnectPeriod: 1000
        }
    });

    try {
        // Connect to broker
        await client.connect();
        console.log('Connected to broker');

        // Subscribe to a topic
        await client.subscribe('test/topic');
        console.log('Subscribed to test/topic');

        // Set up message handler
        client.onMessage('test/topic', (topic, message) => {
            console.log(`Received message on ${topic}:`, message.toString());
        });

        // Publish a message
        await client.publish('test/topic', 'Hello MQTT!');
        console.log('Published message');

        // Keep the connection alive for a while
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Clean up
        await client.unsubscribe('test/topic');
        await client.disconnect();
        console.log('Disconnected from broker');

    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}

runBasicClient().catch(console.error);
