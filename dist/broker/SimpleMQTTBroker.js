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
const MongoStorage_1 = require("./storage/MongoStorage");
const RedisStorage_1 = require("./storage/RedisStorage");
const MemoryStorage_1 = require("./storage/MemoryStorage");
const events_1 = __importDefault(require("events"));
class SimpleMQTTBroker extends events_1.default {
    constructor(config) {
        super();
        this.config = config;
        this.broker = new aedes_1.default();
        this.tcpServer = (0, net_1.createServer)(this.broker.handle);
        this.setupEventHandlers();
        this.setupStorage();
    }
    setupStorage() {
        if (!this.config.persistence?.enabled) {
            return;
        }
        switch (this.config.persistence.type) {
            case 'redis':
                if (this.config.persistence.redis) {
                    this.storage = new RedisStorage_1.RedisStorage(this.config.persistence.redis);
                }
                break;
            case 'mongodb':
                if (this.config.persistence.mongodb) {
                    this.storage = new MongoStorage_1.MongoStorage(this.config.persistence.mongodb);
                }
                break;
            case 'memory':
                this.storage = new MemoryStorage_1.MemoryStorage();
                break;
        }
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
    async start() {
        return new Promise((resolve, reject) => {
            try {
                this.tcpServer.listen(this.config.mqtt.port, this.config.mqtt.host, () => {
                    console.log(`MQTT broker listening on port ${this.config.mqtt.port}`);
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
//# sourceMappingURL=SimpleMQTTBroker.js.map