import { IAuthenticator, AuthResult, AuthCredentials } from './IAuthenticator';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import * as path from 'path';

interface UserConfig {
    username: string;
    password: string; // SHA-256 hash
    acl: {
        publish: string[];
        subscribe: string[];
    };
}

export class FileAuthenticator implements IAuthenticator {
    private users: Map<string, UserConfig> = new Map();

    constructor(private configPath: string) {}

    async init(): Promise<void> {
        try {
            const content = await fs.readFile(this.configPath, 'utf-8');
            const config = JSON.parse(content);
            
            for (const user of config.users) {
                this.users.set(user.username, user);
            }
        } catch (error) {
            console.error('Failed to load auth config:', error);
            throw error;
        }
    }

    private hashPassword(password: Buffer): string {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
        if (!credentials.username || !credentials.password) {
            return { success: false, error: 'Username and password required' };
        }

        const user = this.users.get(credentials.username);
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const hashedPassword = this.hashPassword(credentials.password);
        if (hashedPassword !== user.password) {
            return { success: false, error: 'Invalid password' };
        }

        return { success: true };
    }

    async authorize(clientId: string, topic: string, action: 'publish' | 'subscribe'): Promise<boolean> {
        // Find user by clientId (you might want to maintain a clientId -> username mapping)
        const user = Array.from(this.users.values()).find(u => u.username === clientId);
        if (!user) return false;

        const patterns = action === 'publish' ? user.acl.publish : user.acl.subscribe;
        return patterns.some(pattern => this.topicMatch(pattern, topic));
    }

    private topicMatch(pattern: string, topic: string): boolean {
        const patternParts = pattern.split('/');
        const topicParts = topic.split('/');

        if (patternParts.length > topicParts.length) {
            return false;
        }

        return patternParts.every((part, i) => {
            if (part === '#') return true;
            if (part === '+') return true;
            return part === topicParts[i];
        });
    }
}
