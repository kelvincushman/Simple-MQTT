export interface AuthResult {
    success: boolean;
    error?: string;
}
export interface AuthCredentials {
    username?: string;
    password?: Buffer;
    clientId: string;
}
export interface IAuthenticator {
    authenticate(credentials: AuthCredentials): Promise<AuthResult>;
    authorize(clientId: string, topic: string, action: 'publish' | 'subscribe'): Promise<boolean>;
}
