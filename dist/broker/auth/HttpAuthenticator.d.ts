import { IAuthenticator, AuthResult, AuthCredentials } from './IAuthenticator';
export interface HttpAuthConfig {
    authUrl: string;
    aclUrl: string;
    timeout?: number;
}
export declare class HttpAuthenticator implements IAuthenticator {
    private config;
    constructor(config: HttpAuthConfig);
    authenticate(credentials: AuthCredentials): Promise<AuthResult>;
    authorize(clientId: string, topic: string, action: 'publish' | 'subscribe'): Promise<boolean>;
}
