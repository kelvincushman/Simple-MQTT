"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const broker = new _1.SimpleMQTTBroker({
    mqtt: {
        port: 1883,
        host: '0.0.0.0',
        websocket: {
            enabled: true,
            port: 8080
        }
    },
    persistence: {
        enabled: false,
        type: 'memory'
    },
    auth: {
        enabled: false,
        type: 'basic'
    }
});
// Add more detailed logging with proper type handling
broker.on('client.connected', (client) => {
    console.log('Client connected:', client.id);
});
broker.on('client.disconnected', (client) => {
    console.log('Client disconnected:', client.id);
});
broker.on('message.published', (message) => {
    console.log(`Message published on ${message.topic}:`, message.payload.toString());
});
broker.start()
    .then(() => {
    console.log('MQTT Broker started successfully!');
    console.log('TCP port: 1883');
    console.log('WebSocket port: 8080');
    console.log('Storage: In-memory');
})
    .catch((error) => {
    console.error('Failed to start broker:', error);
});
//# sourceMappingURL=start-broker.js.map