import { HttpAuthConfig } from './broker/auth/HttpAuthenticator';
import { BasicAuthConfig } from './broker/auth/BasicAuthenticator';

export interface BrokerConfig {
    mqtt: {
        port: number;
        host: string;
        websocket?: {
            enabled: boolean;
            port: number;
        };
    };
    persistence?: {
        enabled: boolean;
        type: 'memory' | 'redis' | 'mongodb';
        redis?: {
            url: string;
            host?: string;
            port?: number;
            password?: string;
        };
        mongodb?: {
            url: string;
            database: string;
            collection: string;
        };
    };
    auth?: {
        enabled: boolean;
        type: 'basic' | 'http';
        http?: HttpAuthConfig;
        basic?: BasicAuthConfig;
    };
    tls?: {
        enabled: boolean;
        key: string;
        cert: string;
        ca?: string;
    };
}

export interface ClientConfig {
    brokerUrl: string;
    options?: {
        clientId?: string;
        keepalive?: number;
        reconnectPeriod?: number;
        connectTimeout?: number;
        username?: string;
        password?: string;
        clean?: boolean;
        will?: {
            topic: string;
            payload: string;
            qos?: 0 | 1 | 2;
            retain?: boolean;
        };
    };
}
