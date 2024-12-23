import { createClient, RedisClientType } from 'redis';
import { IStorage } from './IStorage';
import { StoredMessage } from '../../types';
import EventEmitter from 'events';

export interface RedisConfig {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
}

export class RedisStorage extends EventEmitter implements IStorage {
    private client: RedisClientType;
    private connected: boolean = false;

    constructor(config: RedisConfig) {
        super();
        const url = config.url || `redis://${config.host || 'localhost'}:${config.port || 6379}`;
        this.client = createClient({
            url,
            password: config.password
        });

        this.client.on('error' as any, (err) => {
            console.error('Redis Client Error:', err);
            this.connected = false;
            this.emit('broker.error', err);
        });

        this.client.on('ready' as any, () => {
            this.connected = true;
        });

        this.client.on('end' as any, () => {
            this.connected = false;
        });
    }

    public async connect(): Promise<void> {
        if (!this.connected) {
            await this.client.connect();
        }
    }

    public async disconnect(): Promise<void> {
        if (this.connected) {
            await this.client.quit();
            this.connected = false;
        }
    }

    public async storeMessage(topic: string, payload: Buffer): Promise<void> {
        if (!this.connected) {
            throw new Error('Redis client not connected');
        }

        const message: StoredMessage = {
            topic,
            payload,
            timestamp: new Date()
        };

        await this.client.hSet(
            `mqtt:messages:${topic}`,
            message.timestamp.toISOString(),
            JSON.stringify({
                payload: payload.toString('base64'),
                timestamp: message.timestamp
            })
        );
    }

    public async getMessages(topic: string): Promise<StoredMessage[]> {
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

    public async clearMessages(topic?: string): Promise<void> {
        if (!this.connected) {
            throw new Error('Redis client not connected');
        }

        if (topic) {
            await this.client.del(`mqtt:messages:${topic}`);
        } else {
            const keys = await this.client.keys('mqtt:messages:*');
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        }
    }
}
