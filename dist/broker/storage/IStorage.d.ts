export interface StoredMessage {
    topic: string;
    payload: Buffer;
    timestamp: Date;
}
export interface IStorage {
    storeMessage(topic: string, payload: Buffer): Promise<void>;
    getMessages(topic: string, limit?: number): Promise<StoredMessage[]>;
    clearMessages(topic?: string): Promise<void>;
}
