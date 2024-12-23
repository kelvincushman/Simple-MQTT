import { IStorage } from './IStorage';
import { StoredMessage } from '../types';
export interface RedisConfig {
    url: string;
}
export declare class RedisStorage implements IStorage {
    private client;
    private connected;
    constructor(config: RedisConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    storeMessage(topic: string, payload: Buffer): Promise<void>;
    getMessages(topic: string): Promise<StoredMessage[]>;
    clearMessages(topic?: string): Promise<void>;
}
