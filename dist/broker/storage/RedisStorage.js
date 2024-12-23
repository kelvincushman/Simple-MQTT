"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisStorage = void 0;
const redis_1 = require("redis");
const events_1 = __importDefault(require("events"));
class RedisStorage extends events_1.default {
    constructor(config) {
        super();
        this.connected = false;
        const url = config.url || `redis://${config.host || 'localhost'}:${config.port || 6379}`;
        this.client = (0, redis_1.createClient)({
            url,
            password: config.password
        });
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            this.connected = false;
            this.emit('broker.error', err);
        });
        this.client.on('ready', () => {
            this.connected = true;
        });
        this.client.on('end', () => {
            this.connected = false;
        });
    }
    async connect() {
        if (!this.connected) {
            await this.client.connect();
        }
    }
    async disconnect() {
        if (this.connected) {
            await this.client.quit();
            this.connected = false;
        }
    }
    async storeMessage(topic, payload) {
        if (!this.connected) {
            throw new Error('Redis client not connected');
        }
        const message = {
            topic,
            payload,
            timestamp: new Date()
        };
        await this.client.hSet(`mqtt:messages:${topic}`, message.timestamp.toISOString(), JSON.stringify({
            payload: payload.toString('base64'),
            timestamp: message.timestamp
        }));
    }
    async getMessages(topic) {
        if (!this.connected) {
            throw new Error('Redis client not connected');
        }
        const messages = await this.client.hGetAll(`mqtt:messages:${topic}`);
        return Object.values(messages).map(msg => {
            const parsed = JSON.parse(msg);
            return {
                topic,
                payload: Buffer.from(parsed.payload, 'base64'),
                timestamp: new Date(parsed.timestamp)
            };
        });
    }
    async clearMessages(topic) {
        if (!this.connected) {
            throw new Error('Redis client not connected');
        }
        if (topic) {
            await this.client.del(`mqtt:messages:${topic}`);
        }
        else {
            const keys = await this.client.keys('mqtt:messages:*');
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        }
    }
}
exports.RedisStorage = RedisStorage;
//# sourceMappingURL=RedisStorage.js.map