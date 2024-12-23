"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoStorage = void 0;
const mongodb_1 = require("mongodb");
class MongoStorage {
    constructor(config) {
        this.config = config;
        this.client = new mongodb_1.MongoClient(config.url);
    }
    async init() {
        await this.client.connect();
        const db = this.client.db(this.config.database);
        this.collection = db.collection(this.config.collection);
        // Create indexes
        await this.collection.createIndex({ topic: 1 });
        await this.collection.createIndex({ timestamp: 1 });
    }
    async storeMessage(topic, payload) {
        if (!this.collection) {
            throw new Error('MongoDB not initialized');
        }
        const message = {
            topic,
            payload,
            timestamp: new Date()
        };
        await this.collection.insertOne(message);
    }
    async getMessages(topic, limit = 100) {
        if (!this.collection) {
            throw new Error('MongoDB not initialized');
        }
        const messages = await this.collection
            .find({ topic })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();
        return messages;
    }
    async clearMessages(topic) {
        if (!this.collection) {
            throw new Error('MongoDB not initialized');
        }
        if (topic) {
            await this.collection.deleteMany({ topic });
        }
        else {
            await this.collection.deleteMany({});
        }
    }
    async close() {
        await this.client.close();
    }
}
exports.MongoStorage = MongoStorage;
//# sourceMappingURL=MongoStorage.js.map