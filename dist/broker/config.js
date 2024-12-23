"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.defaultConfig = {
    mqtt: {
        port: 1883,
        host: '0.0.0.0',
        websocket: {
            enabled: true,
            port: 8080
        }
    },
    auth: {
        type: 'none',
        allowAnonymous: true,
        allowZeroByteClientId: false
    },
    persistence: {
        enabled: true,
        type: 'memory'
    }
};
//# sourceMappingURL=config.js.map