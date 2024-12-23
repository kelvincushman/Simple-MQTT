"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpAuthenticator = void 0;
const axios_1 = __importDefault(require("axios"));
class HttpAuthenticator {
    constructor(config) {
        this.config = config;
    }
    async authenticate(credentials) {
        try {
            const response = await axios_1.default.post(this.config.authUrl, {
                username: credentials.username,
                password: credentials.password?.toString(),
                clientId: credentials.clientId
            }, {
                timeout: this.config.timeout || 5000
            });
            return { success: response.status === 200 };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Authentication failed'
            };
        }
    }
    async authorize(clientId, topic, action) {
        try {
            const response = await axios_1.default.post(this.config.aclUrl, {
                clientId,
                topic,
                action
            }, {
                timeout: this.config.timeout || 5000
            });
            return response.status === 200;
        }
        catch (error) {
            return false;
        }
    }
}
exports.HttpAuthenticator = HttpAuthenticator;
//# sourceMappingURL=HttpAuthenticator.js.map