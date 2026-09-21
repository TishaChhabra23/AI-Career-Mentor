import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Derives the 32-byte encryption key from the hex-encoded ENCRYPTION_KEY env variable.
 */
const getEncryptionKey = (): Buffer => {
  return Buffer.from(env.ENCRYPTION_KEY, 'hex');
};

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a combined string: ivHex:authTagHex:ciphertextHex
 * A fresh random IV is generated for each encryption call.
 */
export const encryptKey = (plaintext: string): string => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts a ciphertext string that was encrypted with encryptKey().
 * Expects format: ivHex:authTagHex:ciphertextHex
 * Throws AppError if decryption or authentication fails.
 */
export const decryptKey = (encryptedText: string): string => {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted credential format');
    }

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    throw new AppError('Failed to decrypt stored credential. Please reconfigure your AI API key.', 500);
  }
};

/**
 * Creates a masked representation of an API key, showing only the last 4 characters.
 * Example: "AIzaSyB...7K2A" → "••••••••••••7K2A"
 */
export const maskApiKey = (apiKey: string): string => {
  if (apiKey.length <= 4) {
    return '••••';
  }
  const lastFour = apiKey.slice(-4);
  return '•'.repeat(12) + lastFour;
};
