import { IStorage, StoredMessage } from './IStorage';

export class MemoryStorage implements IStorage {
    private messages: StoredMessage[] = [];

    public async storeMessage(topic: string, payload: Buffer): Promise<void> {
        const message: StoredMessage = {
            topic,
            payload,
            timestamp: new Date()
        };
        this.messages.push(message);
    }

    public async getMessages(topic: string, limit: number = 100): Promise<StoredMessage[]> {
        return this.messages
            .filter(msg => msg.topic === topic)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }

    public async clearMessages(topic?: string): Promise<void> {
        if (topic) {
            this.messages = this.messages.filter(msg => msg.topic !== topic);
        } else {
            this.messages = [];
        }
    }
}
