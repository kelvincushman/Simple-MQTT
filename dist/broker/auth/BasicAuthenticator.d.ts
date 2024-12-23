import { IAuthenticator, AuthCredentials } from './IAuthenticator';
export interface BasicAuthConfig {
    users: Array<{
        username: string;
        password: string;
        clientId?: string;
    }>;
}
export declare class BasicAuthenticator implements IAuthenticator {
    private config;
    constructor(config: BasicAuthConfig);
    authenticate(credentials: AuthCredentials): Promise<boolean>;
}
