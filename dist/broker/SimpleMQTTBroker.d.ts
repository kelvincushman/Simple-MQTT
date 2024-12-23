import EventEmitter from 'events';
import { BrokerConfig } from '../config';
import { IStorage } from './storage/IStorage';
import { BrokerEvents } from '../types';
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
    private authenticate;
    private setupEventHandlers;
    start(): Promise<void>;
    stop(): Promise<void>;
    getStorage(): IStorage | undefined;
}
declare module 'events' {
    interface EventEmitter {
        on<K extends keyof BrokerEvents>(event: K, listener: (arg: BrokerEvents[K]) => void): this;
        emit<K extends keyof BrokerEvents>(event: K, arg: BrokerEvents[K]): boolean;
    }
}
