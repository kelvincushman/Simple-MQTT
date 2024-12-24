import Aedes, { AedesOptions, Client, Connection } from 'aedes';
import { createServer } from 'net';
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import ws from 'ws';
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

        const aedesConfig: AedesOptions = {
            id: 'SimpleMQTT',
            heartbeatInterval: 60000, // 60 seconds
            connectTimeout: 30000,    // 30 seconds
            concurrency: 100,
            queueLimit: 42,
            maxClientsIdLength: 23
        };

        this.broker = new Aedes(aedesConfig);
        this.tcpServer = createServer(this.broker.handle);

        this.setupEventHandlers();
        this.setupStorage();
        if (config.auth?.enabled) {
            this.setupAuth();
        }
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

    private setupEventHandlers() {
        this.broker.on('client', (client) => {
            console.log('Client connected:', client.id);
            this.emit('client.connected', {
                id: client.id,
                address: (client.conn as any).remoteAddress
            });
        });

        this.broker.on('clientDisconnect', (client) => {
            console.log('Client disconnected:', client.id);
            this.emit('client.disconnected', {
                id: client.id,
                address: (client.conn as any).remoteAddress
            });
        });

        this.broker.on('publish', (packet, client) => {
            if (client) {
                console.log('Message published:', {
                    topic: packet.topic,
                    clientId: client.id
                });

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
            console.log('Client subscribed:', {
                clientId: client.id,
                topics: subscriptions.map(s => s.topic)
            });
            this.emit('client.subscribe', {
                clientId: client.id,
                subscriptions: subscriptions.map(s => ({
                    topic: s.topic,
                    qos: s.qos
                }))
            });
        });

        this.broker.on('clientError', (client: Client | null, error: Error) => {
            console.error('Client error:', {
                clientId: client?.id,
                error: error.message,
                stack: error.stack
            });
            this.emit('broker.error', {
                error: error.message,
                clientId: client?.id
            });
        });

        this.broker.on('connectionError', (client: Client | null, error: Error) => {
            console.error('Connection error:', {
                clientId: client?.id,
                error: error.message,
                stack: error.stack
            });
            this.emit('broker.error', {
                error: error.message,
                clientId: client?.id,
                type: 'connection'
            });
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
                        
                        const wsServer = new ws.Server({ 
                            server: httpServer,
                            path: '/'
                        });
                        
                        wsServer.on('connection', (socket: ws, request: any) => {
                            console.log('New WebSocket connection from:', request.socket.remoteAddress);
                            
                            const stream = ws.createWebSocketStream(socket);
                            
                            stream.on('error', (error: Error) => {
                                console.error('WebSocket stream error:', error);
                            });
                            
                            this.broker.handle(stream);
                        });
                        
                        wsServer.on('error', (error: Error) => {
                            console.error('WebSocket server error:', error);
                            this.emit('broker.error', {
                                error: error.message,
                                type: 'websocket'
                            });
                        });
                        
                        const port = this.config.mqtt.websocket?.port || 8080;
                        httpServer.listen(port, () => {
                            console.log(`WebSocket server listening on port ${port}`);
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });

                this.tcpServer.on('error', (error) => {
                    console.error('TCP server error:', error);
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    public async stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                if (this.wsServer) {
                    this.wsServer.close();
                }
                this.tcpServer.close(() => {
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
