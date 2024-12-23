"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MQTTClient = void 0;
const mqtt_1 = require("mqtt");
const events_1 = require("events");
class MQTTClient extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.client = null;
        this.messageHandlers = new Map();
        this.config = config;
    }
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.client = (0, mqtt_1.connect)(this.config.brokerUrl, this.config.options);
                this.client.on('connect', () => {
                    this.emit('connected');
                    resolve();
                });
                this.client.on('error', (error) => {
                    this.emit('error', error);
                    reject(error);
                });
                this.client.on('message', (topic, message, packet) => {
                    this.emit('message', topic, message, packet);
                    this.handleMessage(topic, message);
                });
                this.client.on('disconnect', () => {
                    this.emit('disconnected');
                });
                this.client.on('offline', () => {
                    this.emit('offline');
                });
                this.client.on('reconnect', () => {
                    this.emit('reconnecting');
                });
            }
            catch (error) {
                reject(error);
            }
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
                    this.client = null;
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
    async subscribe(topics, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error('Client not connected'));
                return;
            }
            const topicsArray = Array.isArray(topics) ? topics : [topics];
            this.client.subscribe(topicsArray, { qos: options.qos || 0 }, (err, granted) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async unsubscribe(topics) {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error('Client not connected'));
                return;
            }
            const topicsArray = Array.isArray(topics) ? topics : [topics];
            this.client.unsubscribe(topicsArray, (error) => {
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
    handleMessage(topic, message) {
        for (const [pattern, handlers] of this.messageHandlers.entries()) {
            if (this.topicMatches(topic, pattern)) {
                handlers.forEach(handler => handler(topic, message));
            }
        }
    }
    topicMatches(topic, pattern) {
        const topicParts = topic.split('/');
        const patternParts = pattern.split('/');
        if (patternParts.length > topicParts.length) {
            return false;
        }
        return patternParts.every((part, i) => {
            if (part === '#')
                return true;
            if (part === '+')
                return true;
            return part === topicParts[i];
        });
    }
}
exports.MQTTClient = MQTTClient;
//# sourceMappingURL=MQTTClient.js.map