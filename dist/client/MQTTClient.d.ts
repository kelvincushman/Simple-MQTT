import { ClientConfig } from '../config';
import { PublishOptions, SubscribeOptions, MessageHandler } from '../types';
export declare class MQTTClient {
    private client?;
    private config;
    private messageHandlers;
    private connected;
    constructor(config: ClientConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    publish(topic: string, message: string | Buffer, options?: PublishOptions): Promise<void>;
    subscribe(topic: string | string[], options?: SubscribeOptions): Promise<void>;
    unsubscribe(topic: string | string[]): Promise<void>;
    onMessage(topic: string, handler: MessageHandler): void;
    removeMessageHandler(topic: string, handler: MessageHandler): void;
    isConnected(): boolean;
}
