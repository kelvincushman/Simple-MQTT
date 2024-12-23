import { IStorage, StoredMessage } from './IStorage';
export declare class MemoryStorage implements IStorage {
    private messages;
    storeMessage(topic: string, payload: Buffer): Promise<void>;
    getMessages(topic: string, limit?: number): Promise<StoredMessage[]>;
    clearMessages(topic?: string): Promise<void>;
}
