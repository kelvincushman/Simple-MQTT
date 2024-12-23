import { MQTTClient } from '../MQTTClient';

async function testClient() {
    const client = new MQTTClient({
        brokerUrl: 'mqtt://localhost:1883',
        options: {
            clientId: 'test-client',
            keepalive: 60,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000
        }
    });

    try {
        console.log('Connecting to broker...');
        await client.connect();
        console.log('Connected successfully!');

        // Subscribe to a test topic
        console.log('Subscribing to test/topic...');
        await client.subscribe('test/topic', { qos: 1 });
        console.log('Subscribed successfully!');

        // Set up message handler
        client.onMessage('test/topic', (topic, message) => {
            console.log(`Received message on ${topic}:`, message.toString());
        });

        // Publish a test message
        console.log('Publishing test message...');
        await client.publish('test/topic', 'Hello from test client!', { qos: 1 });
        console.log('Message published successfully!');

        // Keep the connection alive for a while to receive messages
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Clean up
        console.log('Cleaning up...');
        await client.unsubscribe('test/topic');
        await client.disconnect();
        console.log('Disconnected successfully!');

    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}

testClient().catch(console.error);
