import { IStorage } from './IStorage';
import { StoredMessage } from '../../types';
import EventEmitter from 'events';
export interface RedisConfig {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
}
export declare class RedisStorage extends EventEmitter implements IStorage {
    private client;
    private connected;
    constructor(config: RedisConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    storeMessage(topic: string, payload: Buffer): Promise<void>;
    getMessages(topic: string): Promise<StoredMessage[]>;
    clearMessages(topic?: string): Promise<void>;
}
