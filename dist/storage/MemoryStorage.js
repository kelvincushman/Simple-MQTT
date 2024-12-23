"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStorage = void 0;
class MemoryStorage {
    constructor() {
        this.connected = false;
        this.messages = new Map();
    }
    async connect() {
        this.connected = true;
    }
    async disconnect() {
        this.connected = false;
        this.messages.clear();
    }
    async storeMessage(topic, payload) {
        if (!this.connected) {
            throw new Error('Memory storage not connected');
        }
        const message = {
            topic,
            payload,
            timestamp: new Date()
        };
        const topicMessages = this.messages.get(topic) || [];
        topicMessages.push(message);
        this.messages.set(topic, topicMessages);
    }
    async getMessages(topic) {
        if (!this.connected) {
            throw new Error('Memory storage not connected');
        }
        return this.messages.get(topic) || [];
    }
    async clearMessages(topic) {
        if (!this.connected) {
            throw new Error('Memory storage not connected');
        }
        if (topic) {
            this.messages.delete(topic);
        }
        else {
            this.messages.clear();
        }
    }
}
exports.MemoryStorage = MemoryStorage;
//# sourceMappingURL=MemoryStorage.js.map