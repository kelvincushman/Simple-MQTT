import { createClient, RedisClientType } from 'redis';
import { IStorage, StoredMessage } from './IStorage';

export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
}

export class RedisStorage implements IStorage {
    private client: RedisClientType;
    private readonly messagePrefix = 'mqtt:message:';

    constructor(config: RedisConfig) {
        this.client = createClient({
            url: `redis://${config.host}:${config.port}`,
            password: config.password
        });
    }

    public async storeMessage(topic: string, payload: Buffer): Promise<void> {
        const message: StoredMessage = {
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

    public async getMessages(topic: string, limit: number = 100): Promise<StoredMessage[]> {
        const pattern = `${this.messagePrefix}${topic}:*`;
        const keys = await this.client.keys(pattern);
        const messages: StoredMessage[] = [];

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

    public async clearMessages(topic?: string): Promise<void> {
        if (topic) {
            const pattern = `${this.messagePrefix}${topic}:*`;
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        } else {
            const pattern = `${this.messagePrefix}*`;
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        }
    }

    public async connect(): Promise<void> {
        await this.client.connect();
    }

    public async disconnect(): Promise<void> {
        await this.client.quit();
    }
}
