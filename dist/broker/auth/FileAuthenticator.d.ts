import { IAuthenticator, AuthResult, AuthCredentials } from './IAuthenticator';
export declare class FileAuthenticator implements IAuthenticator {
    private configPath;
    private users;
    constructor(configPath: string);
    init(): Promise<void>;
    private hashPassword;
    authenticate(credentials: AuthCredentials): Promise<AuthResult>;
    authorize(clientId: string, topic: string, action: 'publish' | 'subscribe'): Promise<boolean>;
    private topicMatch;
}
