import { IStorage, StoredMessage } from './IStorage';
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
}
export declare class RedisStorage implements IStorage {
    private client;
    private readonly messagePrefix;
    constructor(config: RedisConfig);
    storeMessage(topic: string, payload: Buffer): Promise<void>;
    getMessages(topic: string, limit?: number): Promise<StoredMessage[]>;
    clearMessages(topic?: string): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
