"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const MQTTClient_1 = require("../MQTTClient");
const mqtt = __importStar(require("mqtt"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs/promises"));
jest.mock('mqtt');
describe('ModernMQTTClient', () => {
    let client;
    let mockMqttClient;
    beforeEach(() => {
        mockMqttClient = {
            on: jest.fn(),
            publish: jest.fn(),
            subscribe: jest.fn(),
            unsubscribe: jest.fn(),
            end: jest.fn(),
            connected: true
        };
        mqtt.connect.mockReturnValue(mockMqttClient);
        client = new MQTTClient_1.ModernMQTTClient('mqtt://localhost:1883', {
            persistence: {
                enabled: true,
                path: path.join(os.tmpdir(), 'mqtt-test'),
                encryptionKey: 'test-key'
            }
        });
    });
    afterEach(async () => {
        try {
            await fs.rm(path.join(os.tmpdir(), 'mqtt-test'), { recursive: true });
        }
        catch (error) {
            // Ignore errors if directory doesn't exist
        }
    });
    describe('connect', () => {
        it('should connect successfully', async () => {
            const connectPromise = client.connect();
            // Simulate successful connection
            const connectHandler = mockMqttClient.on.mock.calls.find(call => call[0] === 'connect')[1];
            connectHandler();
            await connectPromise;
            expect(mqtt.connect).toHaveBeenCalledWith('mqtt://localhost:1883', expect.any(Object));
        });
        it('should handle connection errors', async () => {
            const connectPromise = client.connect();
            // Simulate error
            const errorHandler = mockMqttClient.on.mock.calls.find(call => call[0] === 'error')[1];
            errorHandler(new Error('Connection failed'));
            await expect(connectPromise).rejects.toThrow('Connection failed');
        });
    });
    describe('publish', () => {
        beforeEach(async () => {
            await client.connect();
        });
        it('should publish messages successfully', async () => {
            mockMqttClient.publish.mockImplementation((topic, message, opts, callback) => {
                callback();
            });
            await client.publish('test/topic', 'test message', { qos: 1 });
            expect(mockMqttClient.publish).toHaveBeenCalledWith('test/topic', expect.any(Buffer), { qos: 1 }, expect.any(Function));
        });
        it('should handle publish errors', async () => {
            mockMqttClient.publish.mockImplementation((topic, message, opts, callback) => {
                callback(new Error('Publish failed'));
            });
            await expect(client.publish('test/topic', 'test message')).rejects.toThrow('Publish failed');
        });
    });
    describe('subscribe', () => {
        beforeEach(async () => {
            await client.connect();
        });
        it('should subscribe to topics successfully', async () => {
            mockMqttClient.subscribe.mockImplementation((topic, callback) => {
                callback();
            });
            const callback = jest.fn();
            await client.subscribe('test/topic', callback);
            expect(mockMqttClient.subscribe).toHaveBeenCalledWith('test/topic', expect.any(Function));
        });
        it('should handle subscription errors', async () => {
            mockMqttClient.subscribe.mockImplementation((topic, callback) => {
                callback(new Error('Subscribe failed'));
            });
            const callback = jest.fn();
            await expect(client.subscribe('test/topic', callback)).rejects.toThrow('Subscribe failed');
        });
    });
    describe('message persistence', () => {
        beforeEach(async () => {
            await client.connect();
        });
        it('should store and retrieve messages', async () => {
            const testMessage = 'test message';
            const testTopic = 'test/topic';
            await client.publish(testTopic, testMessage, { qos: 1 });
            const messages = await client.getStoredMessages(testTopic);
            expect(messages).toHaveLength(1);
            expect(messages[0].topic).toBe(testTopic);
            expect(messages[0].payload.toString()).toBe(testMessage);
        });
        it('should clear stored messages', async () => {
            await client.publish('test/topic', 'test message', { qos: 1 });
            await client.clearStoredMessages();
            const messages = await client.getStoredMessages('test/topic');
            expect(messages).toHaveLength(0);
        });
    });
});
