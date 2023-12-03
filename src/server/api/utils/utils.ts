import crypto from 'crypto';

const iv = Buffer.from(process.env.ENCRYPTION_IV as string, 'hex');
const key = Buffer.from(process.env.ENCRYPTION_KEY as string, 'hex');
const alg = 'aes-256-cbc';

export function encryptString(str: string) {
  const cipher = crypto.createCipheriv(alg, key, iv);
  let encrypted = cipher.update(str, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
}

export function decryptString(str: string) {
  const decipher = crypto.createDecipheriv(alg, key, iv);
  let decrypted = decipher.update(str, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}
