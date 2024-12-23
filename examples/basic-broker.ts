import { SimpleMQTTBroker } from '../src';

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

broker.on('message.published', (info) => {
    console.log(`Message published on ${info.topic}:`, info.payload.toString());
});

broker.start()
    .then(() => console.log('Broker started'))
    .catch(console.error);
