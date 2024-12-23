export interface StoredMessage {
    topic: string;
    payload: Buffer;
    timestamp: number;
    qos: number;
    retain: boolean;
    messageId?: string;
}
export interface IMessageStore {
    saveMessage(message: StoredMessage): Promise<void>;
    getMessages(topic: string): Promise<StoredMessage[]>;
    deleteMessage(messageId: string): Promise<void>;
    clear(): Promise<void>;
}
export declare class FileMessageStore implements IMessageStore {
    private storePath;
    private encryptionKey?;
    constructor(storePath: string, encryptionKey?: string);
    private encrypt;
    private decrypt;
    saveMessage(message: StoredMessage): Promise<void>;
    getMessages(topic: string): Promise<StoredMessage[]>;
    deleteMessage(messageId: string): Promise<void>;
    clear(): Promise<void>;
}
