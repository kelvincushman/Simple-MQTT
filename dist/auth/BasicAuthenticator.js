"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicAuthenticator = void 0;
class BasicAuthenticator {
    constructor(config) {
        this.config = config;
    }
    async authenticate(credentials) {
        const user = this.config.users.find(u => {
            if (u.clientId && u.clientId !== credentials.clientId) {
                return false;
            }
            return u.username === credentials.username &&
                u.password === credentials.password;
        });
        return user !== undefined;
    }
}
exports.BasicAuthenticator = BasicAuthenticator;
//# sourceMappingURL=BasicAuthenticator.js.map