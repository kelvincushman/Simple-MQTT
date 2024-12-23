import { MongoClient, Collection } from 'mongodb';
import { IStorage } from './IStorage';
import { StoredMessage } from '../../types';

export interface MongoConfig {
    url: string;
    database: string;
    collection: string;
}

export class MongoStorage implements IStorage {
    private client: MongoClient;
    private collection?: Collection;
    private connected: boolean = false;

    constructor(config: MongoConfig) {
        this.client = new MongoClient(config.url);
        this.collection = this.client
            .db(config.database)
            .collection(config.collection);
    }

    public async connect(): Promise<void> {
        if (!this.connected) {
            await this.client.connect();
            this.connected = true;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.connected) {
            await this.client.close();
            this.connected = false;
        }
    }

    public async storeMessage(topic: string, payload: Buffer): Promise<void> {
        if (!this.connected || !this.collection) {
            throw new Error('MongoDB client not connected');
        }

        const message: StoredMessage = {
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

    public async getMessages(topic: string): Promise<StoredMessage[]> {
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

    public async clearMessages(topic?: string): Promise<void> {
        if (!this.connected || !this.collection) {
            throw new Error('MongoDB client not connected');
        }

        if (topic) {
            await this.collection.deleteMany({ topic });
        } else {
            await this.collection.deleteMany({});
        }
    }
}
