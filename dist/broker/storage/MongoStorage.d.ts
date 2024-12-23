import { IStorage } from './IStorage';
import { StoredMessage } from '../../types';
export interface MongoConfig {
    url: string;
    database: string;
    collection: string;
}
export declare class MongoStorage implements IStorage {
    private client;
    private collection?;
    private connected;
    constructor(config: MongoConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    storeMessage(topic: string, payload: Buffer): Promise<void>;
    getMessages(topic: string): Promise<StoredMessage[]>;
    clearMessages(topic?: string): Promise<void>;
}
