import Aedes from 'aedes';
import { createServer } from 'net';
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import { createServer as createWebSocketServer } from 'websocket-stream';
import { BrokerConfig } from './config';
import { IStorage } from './storage/IStorage';
import { MongoStorage } from './storage/MongoStorage';
import { RedisStorage } from './storage/RedisStorage';
import { MemoryStorage } from './storage/MemoryStorage';
import EventEmitter from 'events';

export class SimpleMQTTBroker extends EventEmitter {
    private broker: Aedes;
    private tcpServer: ReturnType<typeof createServer>;
    private wsServer?: HttpServer;
    private storage?: IStorage;
    private config: BrokerConfig;

    constructor(config: BrokerConfig) {
        super();
        this.config = config;
        this.broker = new Aedes();
        this.tcpServer = createServer(this.broker.handle);

        this.setupEventHandlers();
        this.setupStorage();
    }

    private setupStorage() {
        if (!this.config.persistence?.enabled) {
            return;
        }

        switch (this.config.persistence.type) {
            case 'redis':
                if (this.config.persistence.redis) {
                    this.storage = new RedisStorage(this.config.persistence.redis);
                }
                break;
            case 'mongodb':
                if (this.config.persistence.mongodb) {
                    this.storage = new MongoStorage(this.config.persistence.mongodb);
                }
                break;
            case 'memory':
                this.storage = new MemoryStorage();
                break;
        }
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
                this.emit('message.published', {
                    topic: packet.topic,
                    payload: packet.payload,
                    qos: packet.qos,
                    retain: packet.retain,
                    clientId: client.id
                });

                if (this.storage && packet.payload instanceof Buffer) {
                    this.storage.storeMessage(packet.topic, packet.payload);
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
    }

    public async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.tcpServer.listen(this.config.mqtt.port, this.config.mqtt.host, () => {
                    console.log(`MQTT broker listening on port ${this.config.mqtt.port}`);

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
