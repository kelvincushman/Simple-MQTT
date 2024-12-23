import { IAuthenticator, AuthCredentials } from './IAuthenticator';
export interface HttpAuthConfig {
    url: string;
    method: string;
    headers?: Record<string, string>;
}
export declare class HttpAuthenticator implements IAuthenticator {
    private config;
    constructor(config: HttpAuthConfig);
    authenticate(credentials: AuthCredentials): Promise<boolean>;
}
