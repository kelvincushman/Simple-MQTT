import { IAuthenticator, AuthCredentials } from './IAuthenticator';

export interface HttpAuthConfig {
    url: string;
    method: string;
    headers?: Record<string, string>;
}

export class HttpAuthenticator implements IAuthenticator {
    private config: HttpAuthConfig;

    constructor(config: HttpAuthConfig) {
        this.config = config;
    }

    public async authenticate(credentials: AuthCredentials): Promise<boolean> {
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
        } catch (error) {
            console.error('HTTP Authentication error:', error);
            return false;
        }
    }
}
