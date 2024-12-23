import Aedes from 'aedes';
import { createServer } from 'net';
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import { createServer as createWebSocketServer } from 'websocket-stream';
import EventEmitter from 'events';
import { BrokerConfig } from '../config';
import { IStorage } from './storage/IStorage';
import { MongoStorage } from './storage/MongoStorage';
import { RedisStorage } from './storage/RedisStorage';
import { MemoryStorage } from './storage/MemoryStorage';
import { BrokerEvents } from '../types';
import { IAuthenticator } from './auth/IAuthenticator';
import { HttpAuthenticator } from './auth/HttpAuthenticator';
import { BasicAuthenticator } from './auth/BasicAuthenticator';

export class SimpleMQTTBroker extends EventEmitter {
    private broker: Aedes;
    private tcpServer: ReturnType<typeof createServer>;
    private wsServer?: HttpServer;
    private storage?: IStorage;
    private authenticator?: IAuthenticator;
    private config: BrokerConfig;

    constructor(config: BrokerConfig) {
        super();
        this.config = config;
        this.broker = new Aedes({
            authenticate: this.authenticate.bind(this)
        });
        this.tcpServer = createServer(this.broker.handle);

        this.setupEventHandlers();
        this.setupStorage();
        this.setupAuth();
    }

    private async setupStorage() {
        if (!this.config.persistence?.enabled) {
            return;
        }

        switch (this.config.persistence.type) {
            case 'redis':
                if (this.config.persistence.redis) {
                    this.storage = new RedisStorage(this.config.persistence.redis);
                    await this.storage.connect();
                }
                break;
            case 'mongodb':
                if (this.config.persistence.mongodb) {
                    this.storage = new MongoStorage(this.config.persistence.mongodb);
                    await this.storage.connect();
                }
                break;
            case 'memory':
                this.storage = new MemoryStorage();
                await this.storage.connect();
                break;
        }
    }

    private setupAuth() {
        if (!this.config.auth?.enabled) {
            return;
        }

        switch (this.config.auth.type) {
            case 'http':
                if (this.config.auth.http) {
                    this.authenticator = new HttpAuthenticator(this.config.auth.http);
                }
                break;
            case 'basic':
                if (this.config.auth.basic) {
                    this.authenticator = new BasicAuthenticator(this.config.auth.basic);
                }
                break;
        }
    }

    private async authenticate(client: any, username: string | undefined, password: Buffer | undefined): Promise<boolean> {
        if (!this.authenticator) {
            return true;
        }

        return this.authenticator.authenticate({
            clientId: client.id,
            username,
            password: password ? password.toString() : undefined
        });
    }

    private setupEventHandlers() {
        this.broker.on('client', (client) => {
            this.emit('client.connected', {
                id: client.id,
                address: (client.conn as any).remoteAddress
            });
        });

        this.broker.on('clientDisconnect', (client) => {
            this.emit('client.disconnected', {
                id: client.id,
                address: (client.conn as any).remoteAddress
            });
        });

        this.broker.on('publish', (packet, client) => {
            if (client) {
                const payload = packet.payload instanceof Buffer 
                    ? packet.payload 
                    : Buffer.from(packet.payload);

                this.emit('message.published', {
                    topic: packet.topic,
                    payload,
                    qos: packet.qos,
                    retain: packet.retain,
                    clientId: client.id
                });

                if (this.storage) {
                    this.storage.storeMessage(packet.topic, payload);
                }
            }
        });

        this.broker.on('subscribe', (subscriptions, client) => {
            this.emit('client.subscribe', {
                clientId: client.id,
                subscriptions: subscriptions.map(s => ({
                    topic: s.topic,
                    qos: s.qos
                }))
            });
        });

        this.broker.on('clientError', (_client: any, error: Error) => {
            this.emit('broker.error', error);
        });
    }

    public async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.tcpServer.listen(this.config.mqtt.port, this.config.mqtt.host, () => {
                    console.log(`MQTT broker listening on ${this.config.mqtt.host}:${this.config.mqtt.port}`);

                    if (this.config.mqtt.websocket?.enabled) {
                        const httpServer = createHttpServer();
                        this.wsServer = httpServer;
                        const wsServer = createWebSocketServer({ server: httpServer });
                        wsServer.on('connection', this.broker.handle);
                        
                        httpServer.listen(this.config.mqtt.websocket.port, () => {
                            console.log(`WebSocket server listening on port ${this.config.mqtt.websocket?.port}`);
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    public async stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                if (this.storage) {
                    this.storage.disconnect();
                }

                this.tcpServer.close(() => {
                    if (this.wsServer) {
                        this.wsServer.close();
                    }
                    this.broker.close(() => {
                        resolve();
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    public getStorage(): IStorage | undefined {
        return this.storage;
    }
}

// Add event type declarations
declare module 'events' {
    interface EventEmitter {
        on<K extends keyof BrokerEvents>(event: K, listener: (arg: BrokerEvents[K]) => void): this;
        emit<K extends keyof BrokerEvents>(event: K, arg: BrokerEvents[K]): boolean;
    }
}
