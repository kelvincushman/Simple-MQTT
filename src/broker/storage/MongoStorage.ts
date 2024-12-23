import { MongoClient, Collection } from 'mongodb';
import { IStorage } from './IStorage';

export interface MongoConfig {
    url: string;
    database: string;
    collection: string;
}

export interface StoredMessage {
    topic: string;
    payload: Buffer;
    timestamp: Date;
}

export class MongoStorage implements IStorage {
    private client: MongoClient;
    private collection?: Collection<StoredMessage>;
    private config: MongoConfig;

    constructor(config: MongoConfig) {
        this.config = config;
        this.client = new MongoClient(config.url);
    }

    async init(): Promise<void> {
        await this.client.connect();
        const db = this.client.db(this.config.database);
        this.collection = db.collection<StoredMessage>(this.config.collection);

        // Create indexes
        await this.collection.createIndex({ topic: 1 });
        await this.collection.createIndex({ timestamp: 1 });
    }

    public async storeMessage(topic: string, payload: Buffer): Promise<void> {
        if (!this.collection) {
            throw new Error('MongoDB not initialized');
        }

        const message: StoredMessage = {
            topic,
            payload,
            timestamp: new Date()
        };

        await this.collection.insertOne(message);
    }

    public async getMessages(topic: string, limit: number = 100): Promise<StoredMessage[]> {
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

    public async clearMessages(topic?: string): Promise<void> {
        if (!this.collection) {
            throw new Error('MongoDB not initialized');
        }

        if (topic) {
            await this.collection.deleteMany({ topic });
        } else {
            await this.collection.deleteMany({});
        }
    }

    async close(): Promise<void> {
        await this.client.close();
    }
}
