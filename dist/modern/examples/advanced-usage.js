"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MQTTClient_1 = require("../MQTTClient");
async function main() {
    // Create a client with advanced options
    const client = new MQTTClient_1.MQTTClient({
        brokerUrl: 'mqtt://localhost:1883',
        options: {
            keepalive: 60,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
            will: {
                topic: 'client/status',
                payload: 'offline',
                retain: true
            }
        }
    });
    // Connect to the broker
    try {
        await client.connect();
        console.log('Connected to MQTT broker');
        // Subscribe to multiple topics
        await client.subscribe([
            'sensors/+/temperature',
            'sensors/+/humidity'
        ], { qos: 1 });
        // Set up message handlers for different topics
        client.onMessage('sensors/+/temperature', (topic, message) => {
            const temperature = parseFloat(message.toString());
            console.log(`Temperature reading from ${topic}: ${temperature}°C`);
        });
        client.onMessage('sensors/+/humidity', (topic, message) => {
            const humidity = parseFloat(message.toString());
            console.log(`Humidity reading from ${topic}: ${humidity}%`);
        });
        // Publish messages with different QoS levels
        await client.publish('sensors/room1/temperature', '23.5', { qos: 0 });
        await client.publish('sensors/room1/humidity', '45', { qos: 1 });
        // Use retained messages
        await client.publish('sensors/status', 'online', { retain: true });
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
    // Set up clean disconnect
    process.on('SIGINT', async () => {
        try {
            await client.disconnect();
            console.log('Disconnected from MQTT broker');
            process.exit(0);
        }
        catch (error) {
            console.error('Error during disconnect:', error);
            process.exit(1);
        }
    });
}
main().catch(console.error);
//# sourceMappingURL=advanced-usage.js.map