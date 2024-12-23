export interface AuthCredentials {
    username?: string;
    password?: string;
    clientId: string;
}

export interface IAuthenticator {
    authenticate(credentials: AuthCredentials): Promise<boolean>;
}
