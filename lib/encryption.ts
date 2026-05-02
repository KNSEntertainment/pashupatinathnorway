import crypto from 'crypto';

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is not set');
}

// Ensure the key is exactly 32 bytes for aes-256
const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

/**
 * Encrypts a personal number using AES-256-GCM
 * @param personalNumber - The 11-digit personal number to encrypt
 * @returns Encrypted string in format: iv:tag:encrypted
 */
export function encryptPersonalNumber(personalNumber: string): string {
  if (!personalNumber) return '';
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from('personal-number', 'utf8'));
  
  let encrypted = cipher.update(personalNumber, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Return iv:tag:encrypted format
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted personal number
 * @param encryptedData - The encrypted string in format: iv:tag:encrypted
 * @returns The decrypted personal number
 */
export function decryptPersonalNumber(encryptedData: string): string {
  if (!encryptedData) return '';
  
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAAD(Buffer.from('personal-number', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting personal number:', error);
    return '';
  }
}

/**
 * Validates if a personal number is encrypted
 * @param data - The data to check
 * @returns True if the data appears to be encrypted
 */
export function isEncrypted(data: string): boolean {
  if (!data) return false;
  const parts = data.split(':');
  return parts.length === 3 && 
         parts[0].length === 32 && // iv in hex (16 bytes * 2)
         parts[1].length === 32 && // tag in hex (16 bytes * 2)
         /^[0-9a-fA-F]+$/.test(parts[0] + parts[1]);
}

/**
 * Legacy function to migrate existing plain text personal numbers
 * @param personalNumber - The personal number (may be plain or encrypted)
 * @returns Encrypted personal number if plain text, returns as-is if already encrypted
 */
export function ensureEncrypted(personalNumber: string): string {
  if (!personalNumber) return '';
  
  // If already encrypted, return as-is
  if (isEncrypted(personalNumber)) {
    return personalNumber;
  }
  
  // If plain text, encrypt it
  return encryptPersonalNumber(personalNumber);
}
