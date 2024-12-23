import { StoredMessage } from '../../types';
export interface IStorage {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    storeMessage(topic: string, payload: Buffer): Promise<void>;
    getMessages(topic: string): Promise<StoredMessage[]>;
    clearMessages(topic?: string): Promise<void>;
}
