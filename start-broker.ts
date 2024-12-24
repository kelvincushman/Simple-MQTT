import { SimpleMQTTBroker } from './src';

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
            url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
            database: process.env.MONGODB_DB || 'mqtt_broker',
            collection: process.env.MONGODB_COLLECTION || 'messages'
        }
    }
});

broker.on('client.connected', (info) => {
    console.log('Client connected:', info.id);
});

broker.on('message.published', (info) => {
    console.log(`Message published on ${info.topic}:`, info.payload.toString());
});

broker.start()
    .then(() => {
        console.log('MQTT Broker started successfully!');
        console.log('TCP port: 1883');
        console.log('WebSocket port: 8080');
        console.log('MongoDB URL:', process.env.MONGODB_URL || 'mongodb://localhost:27017');
    })
    .catch(console.error);
