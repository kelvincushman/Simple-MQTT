export interface BrokerConfig {
    mqtt: {
        port: number;
        host: string;
        websocket: {
            enabled: boolean;
            port: number;
        };
    };
    ssl?: {
        enabled: boolean;
        port: number;
        key: string;
        cert: string;
        ca?: string;
        requestCert?: boolean;
        rejectUnauthorized?: boolean;
    };
    auth: {
        type: 'none' | 'file' | 'http';
        allowAnonymous: boolean;
        allowZeroByteClientId: boolean;
        config?: {
            filePath?: string;
            http?: {
                authUrl: string;
                aclUrl: string;
                timeout?: number;
            };
        };
    };
    persistence: {
        enabled: boolean;
        type: 'memory' | 'redis' | 'mongodb';
        redis?: {
            host: string;
            port: number;
            password?: string;
        };
        mongodb?: {
            url: string;
            database: string;
            collection: string;
        };
    };
}
export declare const defaultConfig: BrokerConfig;
