import { IStorage } from './IStorage';
import { StoredMessage } from '../../types';

export class MemoryStorage implements IStorage {
    private messages: Map<string, StoredMessage[]>;
    private connected: boolean = false;

    constructor() {
        this.messages = new Map();
    }

    public async connect(): Promise<void> {
        this.connected = true;
    }

    public async disconnect(): Promise<void> {
        this.connected = false;
        this.messages.clear();
    }

    public async storeMessage(topic: string, payload: Buffer): Promise<void> {
        if (!this.connected) {
            throw new Error('Memory storage not connected');
        }

        const message: StoredMessage = {
            topic,
            payload,
            timestamp: new Date()
        };

        const topicMessages = this.messages.get(topic) || [];
        topicMessages.push(message);
        this.messages.set(topic, topicMessages);
    }

    public async getMessages(topic: string): Promise<StoredMessage[]> {
        if (!this.connected) {
            throw new Error('Memory storage not connected');
        }

        return this.messages.get(topic) || [];
    }

    public async clearMessages(topic?: string): Promise<void> {
        if (!this.connected) {
            throw new Error('Memory storage not connected');
        }

        if (topic) {
            this.messages.delete(topic);
        } else {
            this.messages.clear();
        }
    }
}
