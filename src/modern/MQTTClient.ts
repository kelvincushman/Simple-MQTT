import { connect, MqttClient, IClientOptions, PacketCallback, IPublishPacket } from 'mqtt';
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

export class MQTTClient extends EventEmitter {
    private client: MqttClient | null = null;
    private messageHandlers: Map<string, MessageHandler[]> = new Map();
    private readonly config: MQTTClientConfig;

    constructor(config: MQTTClientConfig) {
        super();
        this.config = config;
    }

    public async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.client = connect(this.config.brokerUrl, this.config.options);

                this.client.on('connect', () => {
                    this.emit('connected');
                    resolve();
                });

                this.client.on('error', (error: Error) => {
                    this.emit('error', error);
                    reject(error);
                });

                this.client.on('message', (topic: string, message: Buffer, packet: IPublishPacket) => {
                    this.emit('message', topic, message, packet);
                    this.handleMessage(topic, message);
                });

                this.client.on('disconnect', () => {
                    this.emit('disconnected');
                });

                this.client.on('offline', () => {
                    this.emit('offline');
                });

                this.client.on('reconnect', () => {
                    this.emit('reconnecting');
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    public async disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                resolve();
                return;
            }

            this.client.end(false, {}, (error?: Error) => {
                if (error) {
                    reject(error);
                } else {
                    this.client = null;
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

            this.client.publish(topic, message, options, (error?: Error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    public async subscribe(topics: string | string[], options: SubscribeOptions = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error('Client not connected'));
                return;
            }

            const topicsArray = Array.isArray(topics) ? topics : [topics];
            this.client.subscribe(topicsArray, { qos: options.qos || 0 }, (err, granted) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public async unsubscribe(topics: string | string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error('Client not connected'));
                return;
            }

            const topicsArray = Array.isArray(topics) ? topics : [topics];
            this.client.unsubscribe(topicsArray, (error?: Error) => {
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

    private handleMessage(topic: string, message: Buffer): void {
        for (const [pattern, handlers] of this.messageHandlers.entries()) {
            if (this.topicMatches(topic, pattern)) {
                handlers.forEach(handler => handler(topic, message));
            }
        }
    }

    private topicMatches(topic: string, pattern: string): boolean {
        const topicParts = topic.split('/');
        const patternParts = pattern.split('/');

        if (patternParts.length > topicParts.length) {
            return false;
        }

        return patternParts.every((part, i) => {
            if (part === '#') return true;
            if (part === '+') return true;
            return part === topicParts[i];
        });
    }
}
