"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MQTTClient_1 = require("./MQTTClient");
async function main() {
    const client = new MQTTClient_1.MQTTClient({
        brokerUrl: 'mqtt://localhost:1883',
        options: {
            keepalive: 60,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000
        }
    });
    try {
        await client.connect();
        console.log('Connected to broker');
        // Subscribe to a topic
        await client.subscribe('test/topic', { qos: 1 });
        // Set up message handler
        client.onMessage('test/topic', (topic, message) => {
            console.log(`Received message on ${topic}:`, message.toString());
        });
        // Publish a message
        await client.publish('test/topic', 'Hello MQTT!', { qos: 1 });
        // Wait for a while to receive messages
        await new Promise(resolve => setTimeout(resolve, 5000));
        // Unsubscribe and disconnect
        await client.unsubscribe('test/topic');
        await client.disconnect();
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        }
        else {
            console.error('Unknown error occurred');
        }
        process.exit(1);
    }
}
main().catch(console.error);
//# sourceMappingURL=example.js.map