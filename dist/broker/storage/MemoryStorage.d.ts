import { IStorage } from './IStorage';
import { StoredMessage } from '../../types';
export declare class MemoryStorage implements IStorage {
    private messages;
    private connected;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    storeMessage(topic: string, payload: Buffer): Promise<void>;
    getMessages(topic: string): Promise<StoredMessage[]>;
    clearMessages(topic?: string): Promise<void>;
}
