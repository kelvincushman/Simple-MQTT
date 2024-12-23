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
export declare class MongoStorage implements IStorage {
    private client;
    private collection?;
    private config;
    constructor(config: MongoConfig);
    init(): Promise<void>;
    storeMessage(topic: string, payload: Buffer): Promise<void>;
    getMessages(topic: string, limit?: number): Promise<StoredMessage[]>;
    clearMessages(topic?: string): Promise<void>;
    close(): Promise<void>;
}
