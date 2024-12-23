import { IClientOptions } from 'mqtt';
import { EventEmitter } from 'events';
export interface MQTTClientConfig {
    brokerUrl: string;
    options?: IClientOptions;
}
export interface PublishOptions {
    qos?: 0 | 1 | 2;
    retain?: boolean;
}
export interface SubscribeOptions {
    qos?: 0 | 1 | 2;
}
type MessageHandler = (topic: string, message: Buffer) => void;
export declare class MQTTClient extends EventEmitter {
    private client;
    private messageHandlers;
    private readonly config;
    constructor(config: MQTTClientConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    publish(topic: string, message: string | Buffer, options?: PublishOptions): Promise<void>;
    subscribe(topics: string | string[], options?: SubscribeOptions): Promise<void>;
    unsubscribe(topics: string | string[]): Promise<void>;
    onMessage(topic: string, handler: MessageHandler): void;
    private handleMessage;
    private topicMatches;
}
export {};
