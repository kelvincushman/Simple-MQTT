"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisStorage = void 0;
const redis_1 = require("redis");
class RedisStorage {
    constructor(config) {
        this.messagePrefix = 'mqtt:message:';
        this.client = (0, redis_1.createClient)({
            url: `redis://${config.host}:${config.port}`,
            password: config.password
        });
    }
    async storeMessage(topic, payload) {
        const message = {
            topic,
            payload,
            timestamp: new Date()
        };
        const key = `${this.messagePrefix}${topic}:${message.timestamp.getTime()}`;
        await this.client.set(key, JSON.stringify({
            topic: message.topic,
            payload: message.payload.toString('base64'),
            timestamp: message.timestamp.toISOString()
        }));
    }
    async getMessages(topic, limit = 100) {
        const pattern = `${this.messagePrefix}${topic}:*`;
        const keys = await this.client.keys(pattern);
        const messages = [];
        for (const key of keys.slice(0, limit)) {
            const data = await this.client.get(key);
            if (data) {
                const parsed = JSON.parse(data);
                messages.push({
                    topic: parsed.topic,
                    payload: Buffer.from(parsed.payload, 'base64'),
                    timestamp: new Date(parsed.timestamp)
                });
            }
        }
        return messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    async clearMessages(topic) {
        if (topic) {
            const pattern = `${this.messagePrefix}${topic}:*`;
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        }
        else {
            const pattern = `${this.messagePrefix}*`;
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        }
    }
    async connect() {
        await this.client.connect();
    }
    async disconnect() {
        await this.client.quit();
    }
}
exports.RedisStorage = RedisStorage;
//# sourceMappingURL=RedisStorage.js.map