import { IPublishPacket } from 'mqtt';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface StoredMessage {
  topic: string;
  payload: Buffer;
  timestamp: number;
  qos: number;
  retain: boolean;
  messageId?: string;
}

export interface IMessageStore {
  saveMessage(message: StoredMessage): Promise<void>;
  getMessages(topic: string): Promise<StoredMessage[]>;
  deleteMessage(messageId: string): Promise<void>;
  clear(): Promise<void>;
}

export class FileMessageStore implements IMessageStore {
  private storePath: string;
  private encryptionKey?: Buffer;

  constructor(storePath: string, encryptionKey?: string) {
    this.storePath = storePath;
    if (encryptionKey) {
      this.encryptionKey = crypto.scryptSync(encryptionKey, 'salt', 32);
    }
  }

  private encrypt(data: Buffer): Buffer {
    if (!this.encryptionKey) return data;
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    return Buffer.concat([iv, authTag, encrypted]);
  }

  private decrypt(data: Buffer): Buffer {
    if (!this.encryptionKey) return data;
    
    const iv = data.subarray(0, 16);
    const authTag = data.subarray(16, 32);
    const encrypted = data.subarray(32);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }

  async saveMessage(message: StoredMessage): Promise<void> {
    const fileName = `${message.messageId || crypto.randomBytes(16).toString('hex')}.msg`;
    const filePath = path.join(this.storePath, fileName);
    
    const data = this.encrypt(Buffer.from(JSON.stringify(message)));
    await fs.mkdir(this.storePath, { recursive: true });
    await fs.writeFile(filePath, data);
  }

  async getMessages(topic: string): Promise<StoredMessage[]> {
    try {
      const files = await fs.readdir(this.storePath);
      const messages: StoredMessage[] = [];

      for (const file of files) {
        if (!file.endsWith('.msg')) continue;
        
        const filePath = path.join(this.storePath, file);
        const data = await fs.readFile(filePath);
        const decrypted = this.decrypt(data);
        const message: StoredMessage = JSON.parse(decrypted.toString());
        
        if (message.topic === topic) {
          messages.push(message);
        }
      }

      return messages.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    const filePath = path.join(this.storePath, `${messageId}.msg`);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.storePath);
      await Promise.all(
        files
          .filter(file => file.endsWith('.msg'))
          .map(file => fs.unlink(path.join(this.storePath, file)))
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
