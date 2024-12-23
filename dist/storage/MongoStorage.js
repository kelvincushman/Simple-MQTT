"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoStorage = void 0;
const mongodb_1 = require("mongodb");
class MongoStorage {
    constructor(config) {
        this.connected = false;
        this.client = new mongodb_1.MongoClient(config.url);
        this.collection = this.client
            .db(config.database)
            .collection(config.collection);
    }
    async connect() {
        if (!this.connected) {
            await this.client.connect();
            this.connected = true;
        }
    }
    async disconnect() {
        if (this.connected) {
            await this.client.close();
            this.connected = false;
        }
    }
    async storeMessage(topic, payload) {
        if (!this.connected || !this.collection) {
            throw new Error('MongoDB client not connected');
        }
        const message = {
            topic,
            payload,
            timestamp: new Date()
        };
        await this.collection.insertOne({
            topic: message.topic,
            payload: message.payload.toString('base64'),
            timestamp: message.timestamp
        });
    }
    async getMessages(topic) {
        if (!this.connected || !this.collection) {
            throw new Error('MongoDB client not connected');
        }
        const documents = await this.collection
            .find({ topic })
            .sort({ timestamp: -1 })
            .toArray();
        return documents.map(doc => ({
            topic: doc.topic,
            payload: Buffer.from(doc.payload, 'base64'),
            timestamp: new Date(doc.timestamp)
        }));
    }
    async clearMessages(topic) {
        if (!this.connected || !this.collection) {
            throw new Error('MongoDB client not connected');
        }
        if (topic) {
            await this.collection.deleteMany({ topic });
        }
        else {
            await this.collection.deleteMany({});
        }
    }
}
exports.MongoStorage = MongoStorage;
//# sourceMappingURL=MongoStorage.js.map