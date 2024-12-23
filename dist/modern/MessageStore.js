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
exports.FileMessageStore = void 0;
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class FileMessageStore {
    constructor(storePath, encryptionKey) {
        this.storePath = storePath;
        if (encryptionKey) {
            this.encryptionKey = crypto.scryptSync(encryptionKey, 'salt', 32);
        }
    }
    encrypt(data) {
        if (!this.encryptionKey)
            return data;
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        const authTag = cipher.getAuthTag();
        return Buffer.concat([iv, authTag, encrypted]);
    }
    decrypt(data) {
        if (!this.encryptionKey)
            return data;
        const iv = data.subarray(0, 16);
        const authTag = data.subarray(16, 32);
        const encrypted = data.subarray(32);
        const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
        decipher.setAuthTag(authTag);
        return Buffer.concat([decipher.update(encrypted), decipher.final()]);
    }
    async saveMessage(message) {
        const fileName = `${message.messageId || crypto.randomBytes(16).toString('hex')}.msg`;
        const filePath = path.join(this.storePath, fileName);
        const data = this.encrypt(Buffer.from(JSON.stringify(message)));
        await fs.mkdir(this.storePath, { recursive: true });
        await fs.writeFile(filePath, data);
    }
    async getMessages(topic) {
        try {
            const files = await fs.readdir(this.storePath);
            const messages = [];
            for (const file of files) {
                if (!file.endsWith('.msg'))
                    continue;
                const filePath = path.join(this.storePath, file);
                const data = await fs.readFile(filePath);
                const decrypted = this.decrypt(data);
                const message = JSON.parse(decrypted.toString());
                if (message.topic === topic) {
                    messages.push(message);
                }
            }
            return messages.sort((a, b) => a.timestamp - b.timestamp);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }
    async deleteMessage(messageId) {
        const filePath = path.join(this.storePath, `${messageId}.msg`);
        try {
            await fs.unlink(filePath);
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }
    async clear() {
        try {
            const files = await fs.readdir(this.storePath);
            await Promise.all(files
                .filter(file => file.endsWith('.msg'))
                .map(file => fs.unlink(path.join(this.storePath, file))));
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }
}
exports.FileMessageStore = FileMessageStore;
//# sourceMappingURL=MessageStore.js.map