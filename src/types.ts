export type QoS = 0 | 1 | 2;

export interface PublishOptions {
    qos?: QoS;
    retain?: boolean;
    dup?: boolean;
}

export interface SubscribeOptions {
    qos?: QoS;
}

export interface MessageHandler {
    (topic: string, message: Buffer): void;
}

export interface StoredMessage {
    topic: string;
    payload: Buffer;
    timestamp: Date;
    qos?: QoS;
    retain?: boolean;
}

export interface BrokerEvents {
    'client.connected': { id: string; address?: string };
    'client.disconnected': { id: string; address?: string };
    'message.published': {
        topic: string;
        payload: Buffer;
        qos?: QoS;
        retain?: boolean;
        clientId?: string;
    };
    'client.subscribe': {
        clientId: string;
        subscriptions: Array<{ topic: string; qos: QoS }>;
    };
    'broker.error': Error;
    'storage.error': Error;
    'storage.ready': void;
    'storage.end': void;
}
