import { IAuthenticator, AuthResult, AuthCredentials } from './IAuthenticator';
import axios from 'axios';

export interface HttpAuthConfig {
    authUrl: string;
    aclUrl: string;
    timeout?: number;
}

export class HttpAuthenticator implements IAuthenticator {
    constructor(private config: HttpAuthConfig) {}

    async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
        try {
            const response = await axios.post(this.config.authUrl, {
                username: credentials.username,
                password: credentials.password?.toString(),
                clientId: credentials.clientId
            }, {
                timeout: this.config.timeout || 5000
            });

            return { success: response.status === 200 };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Authentication failed'
            };
        }
    }

    async authorize(clientId: string, topic: string, action: 'publish' | 'subscribe'): Promise<boolean> {
        try {
            const response = await axios.post(this.config.aclUrl, {
                clientId,
                topic,
                action
            }, {
                timeout: this.config.timeout || 5000
            });

            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}
