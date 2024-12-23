"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpAuthenticator = void 0;
class HttpAuthenticator {
    constructor(config) {
        this.config = config;
    }
    async authenticate(credentials) {
        try {
            const response = await fetch(this.config.url, {
                method: this.config.method,
                headers: {
                    'Content-Type': 'application/json',
                    ...this.config.headers
                },
                body: JSON.stringify(credentials)
            });
            if (!response.ok) {
                return false;
            }
            const result = await response.json();
            return result.authenticated === true;
        }
        catch (error) {
            console.error('HTTP Authentication error:', error);
            return false;
        }
    }
}
exports.HttpAuthenticator = HttpAuthenticator;
//# sourceMappingURL=HttpAuthenticator.js.map