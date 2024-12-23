"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MQTTClient = void 0;
const mqtt_1 = require("mqtt");
class MQTTClient {
    constructor(config) {
        this.config = config;
        this.messageHandlers = new Map();
        this.connected = false;
    }
    async connect() {
        return new Promise((resolve, reject) => {
            const options = {
                ...this.config.options,
                reconnectPeriod: this.config.options?.reconnectPeriod ?? 1000,
                connectTimeout: this.config.options?.connectTimeout ?? 30000,
            };
            this.client = (0, mqtt_1.connect)(this.config.brokerUrl, options);
            this.client.on('connect', () => {
                this.connected = true;
                resolve();
            });
            this.client.on('error', (error) => {
                if (!this.connected) {
                    reject(error);
                }
                // If already connected, just log the error
                console.error('MQTT Client error:', error);
            });
            this.client.on('message', (topic, payload) => {
                const handlers = this.messageHandlers.get(topic);
                if (handlers) {
                    handlers.forEach(handler => handler(topic, payload));
                }
            });
            this.client.on('disconnect', () => {
                this.connected = false;
            });
        });
    }
    async disconnect() {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                resolve();
                return;
            }
            this.client.end(false, {}, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    this.connected = false;
                    resolve();
                }
            });
        });
    }
    async publish(topic, message, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error('Client not connected'));
                return;
            }
            this.client.publish(topic, message, options, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async subscribe(topic, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error('Client not connected'));
                return;
            }
            const topics = Array.isArray(topic) ? topic : [topic];
            this.client.subscribe(topics, { qos: options.qos || 0 }, (err, granted) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async unsubscribe(topic) {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error('Client not connected'));
                return;
            }
            const topics = Array.isArray(topic) ? topic : [topic];
            this.client.unsubscribe(topics, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    onMessage(topic, handler) {
        const handlers = this.messageHandlers.get(topic) || [];
        handlers.push(handler);
        this.messageHandlers.set(topic, handlers);
    }
    removeMessageHandler(topic, handler) {
        const handlers = this.messageHandlers.get(topic);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
                if (handlers.length === 0) {
                    this.messageHandlers.delete(topic);
                }
                else {
                    this.messageHandlers.set(topic, handlers);
                }
            }
        }
    }
    isConnected() {
        return this.connected && this.client?.connected || false;
    }
}
exports.MQTTClient = MQTTClient;
//# sourceMappingURL=MQTTClient.js.map