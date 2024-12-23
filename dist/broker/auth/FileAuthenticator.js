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
exports.FileAuthenticator = void 0;
const fs = __importStar(require("fs/promises"));
const crypto = __importStar(require("crypto"));
class FileAuthenticator {
    constructor(configPath) {
        this.configPath = configPath;
        this.users = new Map();
    }
    async init() {
        try {
            const content = await fs.readFile(this.configPath, 'utf-8');
            const config = JSON.parse(content);
            for (const user of config.users) {
                this.users.set(user.username, user);
            }
        }
        catch (error) {
            console.error('Failed to load auth config:', error);
            throw error;
        }
    }
    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }
    async authenticate(credentials) {
        if (!credentials.username || !credentials.password) {
            return { success: false, error: 'Username and password required' };
        }
        const user = this.users.get(credentials.username);
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const hashedPassword = this.hashPassword(credentials.password);
        if (hashedPassword !== user.password) {
            return { success: false, error: 'Invalid password' };
        }
        return { success: true };
    }
    async authorize(clientId, topic, action) {
        // Find user by clientId (you might want to maintain a clientId -> username mapping)
        const user = Array.from(this.users.values()).find(u => u.username === clientId);
        if (!user)
            return false;
        const patterns = action === 'publish' ? user.acl.publish : user.acl.subscribe;
        return patterns.some(pattern => this.topicMatch(pattern, topic));
    }
    topicMatch(pattern, topic) {
        const patternParts = pattern.split('/');
        const topicParts = topic.split('/');
        if (patternParts.length > topicParts.length) {
            return false;
        }
        return patternParts.every((part, i) => {
            if (part === '#')
                return true;
            if (part === '+')
                return true;
            return part === topicParts[i];
        });
    }
}
exports.FileAuthenticator = FileAuthenticator;
//# sourceMappingURL=FileAuthenticator.js.map