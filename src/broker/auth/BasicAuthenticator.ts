import { IAuthenticator, AuthCredentials } from './IAuthenticator';

export interface BasicAuthConfig {
    users: Array<{
        username: string;
        password: string;
        clientId?: string;
    }>;
}

export class BasicAuthenticator implements IAuthenticator {
    private config: BasicAuthConfig;

    constructor(config: BasicAuthConfig) {
        this.config = config;
    }

    public async authenticate(credentials: AuthCredentials): Promise<boolean> {
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
