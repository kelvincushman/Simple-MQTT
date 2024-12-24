import EventEmitter from 'events';
import { BrokerConfig } from '../config';
import { IStorage } from './storage/IStorage';
export declare class SimpleMQTTBroker extends EventEmitter {
    private broker;
    private tcpServer;
    private wsServer?;
    private storage?;
    private authenticator?;
    private config;
    constructor(config: BrokerConfig);
    private setupStorage;
    private setupAuth;
    private setupEventHandlers;
    start(): Promise<void>;
    stop(): Promise<void>;
    getStorage(): IStorage | undefined;
}
