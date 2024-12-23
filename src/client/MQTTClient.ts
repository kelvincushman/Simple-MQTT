import { connect, MqttClient, IClientOptions } from 'mqtt';
import { ClientConfig } from '../config';
import { PublishOptions, SubscribeOptions, MessageHandler } from '../types';

export class MQTTClient {
    private client?: MqttClient;
    private config: ClientConfig;
    private messageHandlers: Map<string, MessageHandler[]>;
    private connected: boolean;

    constructor(config: ClientConfig) {
        this.config = config;
        this.messageHandlers = new Map();
        this.connected = false;
    }

    public async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            const options: IClientOptions = {
                ...this.config.options,
                reconnectPeriod: this.config.options?.reconnectPeriod ?? 1000,
                connectTimeout: this.config.options?.connectTimeout ?? 30000,
            };

            this.client = connect(this.config.brokerUrl, options);

            this.client.on('connect', () => {
                this.connected = true;
                resolve();
            });

            this.client.on('error', (error) => {
                if (!this.connected) {
                    reject(error);
                }
                // If already connected, just log the error
                console.error('MQTT Client error:', error);
            });

            this.client.on('message', (topic: string, payload: Buffer) => {
                const handlers = this.messageHandlers.get(topic);
                if (handlers) {
                    handlers.forEach(handler => handler(topic, payload));
                }
            });

            this.client.on('disconnect', () => {
                this.connected = false;
            });
        });
    }

    public async disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                resolve();
                return;
            }

            this.client.end(false, {}, (error) => {
                if (error) {
                    reject(error);
                } else {
                    this.connected = false;
                    resolve();
                }
            });
        });
    }

    public async publish(topic: string, message: string | Buffer, options: PublishOptions = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error('Client not connected'));
                return;
            }

            this.client.publish(topic, message, options, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    public async subscribe(topic: string | string[], options: SubscribeOptions = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error('Client not connected'));
                return;
            }

            const topics = Array.isArray(topic) ? topic : [topic];
            this.client.subscribe(topics, { qos: options.qos || 0 }, (err, granted) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public async unsubscribe(topic: string | string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error('Client not connected'));
                return;
            }

            const topics = Array.isArray(topic) ? topic : [topic];
            this.client.unsubscribe(topics, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    public onMessage(topic: string, handler: MessageHandler): void {
        const handlers = this.messageHandlers.get(topic) || [];
        handlers.push(handler);
        this.messageHandlers.set(topic, handlers);
    }

    public removeMessageHandler(topic: string, handler: MessageHandler): void {
        const handlers = this.messageHandlers.get(topic);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
                if (handlers.length === 0) {
                    this.messageHandlers.delete(topic);
                } else {
                    this.messageHandlers.set(topic, handlers);
                }
            }
        }
    }

    public isConnected(): boolean {
        return this.connected && this.client?.connected || false;
    }
}
