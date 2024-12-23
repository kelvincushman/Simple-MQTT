"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleMQTTBroker = void 0;
const aedes_1 = __importDefault(require("aedes"));
const net_1 = require("net");
const http_1 = require("http");
const websocket_stream_1 = require("websocket-stream");
const events_1 = __importDefault(require("events"));
const MongoStorage_1 = require("./storage/MongoStorage");
const RedisStorage_1 = require("./storage/RedisStorage");
const MemoryStorage_1 = require("./storage/MemoryStorage");
const HttpAuthenticator_1 = require("./auth/HttpAuthenticator");
const BasicAuthenticator_1 = require("./auth/BasicAuthenticator");
class SimpleMQTTBroker extends events_1.default {
    constructor(config) {
        super();
        this.config = config;
        this.broker = new aedes_1.default({
            authenticate: this.authenticate.bind(this)
        });
        this.tcpServer = (0, net_1.createServer)(this.broker.handle);
        this.setupEventHandlers();
        this.setupStorage();
        this.setupAuth();
    }
    async setupStorage() {
        if (!this.config.persistence?.enabled) {
            return;
        }
        switch (this.config.persistence.type) {
            case 'redis':
                if (this.config.persistence.redis) {
                    this.storage = new RedisStorage_1.RedisStorage(this.config.persistence.redis);
                    await this.storage.connect();
                }
                break;
            case 'mongodb':
                if (this.config.persistence.mongodb) {
                    this.storage = new MongoStorage_1.MongoStorage(this.config.persistence.mongodb);
                    await this.storage.connect();
                }
                break;
            case 'memory':
                this.storage = new MemoryStorage_1.MemoryStorage();
                await this.storage.connect();
                break;
        }
    }
    setupAuth() {
        if (!this.config.auth?.enabled) {
            return;
        }
        switch (this.config.auth.type) {
            case 'http':
                if (this.config.auth.http) {
                    this.authenticator = new HttpAuthenticator_1.HttpAuthenticator(this.config.auth.http);
                }
                break;
            case 'basic':
                if (this.config.auth.basic) {
                    this.authenticator = new BasicAuthenticator_1.BasicAuthenticator(this.config.auth.basic);
                }
                break;
        }
    }
    async authenticate(client, username, password) {
        if (!this.authenticator) {
            return true;
        }
        return this.authenticator.authenticate({
            clientId: client.id,
            username,
            password: password ? password.toString() : undefined
        });
    }
    setupEventHandlers() {
        this.broker.on('client', (client) => {
            this.emit('client.connected', {
                id: client.id,
                address: client.conn.remoteAddress
            });
        });
        this.broker.on('clientDisconnect', (client) => {
            this.emit('client.disconnected', {
                id: client.id,
                address: client.conn.remoteAddress
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
        this.broker.on('clientError', (_client, error) => {
            this.emit('broker.error', error);
        });
    }
    async start() {
        return new Promise((resolve, reject) => {
            try {
                this.tcpServer.listen(this.config.mqtt.port, this.config.mqtt.host, () => {
                    console.log(`MQTT broker listening on ${this.config.mqtt.host}:${this.config.mqtt.port}`);
                    if (this.config.mqtt.websocket?.enabled) {
                        const httpServer = (0, http_1.createServer)();
                        this.wsServer = httpServer;
                        const wsServer = (0, websocket_stream_1.createServer)({ server: httpServer });
                        wsServer.on('connection', this.broker.handle);
                        httpServer.listen(this.config.mqtt.websocket.port, () => {
                            console.log(`WebSocket server listening on port ${this.config.mqtt.websocket?.port}`);
                            resolve();
                        });
                    }
                    else {
                        resolve();
                    }
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    async stop() {
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
            }
            catch (error) {
                reject(error);
            }
        });
    }
    getStorage() {
        return this.storage;
    }
}
exports.SimpleMQTTBroker = SimpleMQTTBroker;
//# sourceMappingURL=broker.js.map