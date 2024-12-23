import { BrokerConfig } from './config';
import { IStorage } from './storage/IStorage';
import EventEmitter from 'events';
export declare class SimpleMQTTBroker extends EventEmitter {
    private broker;
    private tcpServer;
    private wsServer?;
    private storage?;
    private config;
    constructor(config: BrokerConfig);
    private setupStorage;
    private setupEventHandlers;
    start(): Promise<void>;
    stop(): Promise<void>;
    getStorage(): IStorage | undefined;
}
