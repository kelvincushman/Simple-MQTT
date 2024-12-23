"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStorage = void 0;
class MemoryStorage {
    constructor() {
        this.messages = [];
    }
    async storeMessage(topic, payload) {
        const message = {
            topic,
            payload,
            timestamp: new Date()
        };
        this.messages.push(message);
    }
    async getMessages(topic, limit = 100) {
        return this.messages
            .filter(msg => msg.topic === topic)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    async clearMessages(topic) {
        if (topic) {
            this.messages = this.messages.filter(msg => msg.topic !== topic);
        }
        else {
            this.messages = [];
        }
    }
}
exports.MemoryStorage = MemoryStorage;
//# sourceMappingURL=MemoryStorage.js.map