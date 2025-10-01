import crypto from 'crypto';

export class CryptoUtil {
  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateUUID(): string {
    return crypto.randomUUID();
  }

  static hashSHA256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static hashSHA512(data: string): string {
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  static generateSalt(length: number = 16): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  }

  static verifyPassword(password: string, salt: string, hash: string): boolean {
    const hashToVerify = this.hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashToVerify, 'hex'));
  }

  static encryptAES(text: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  static decryptAES(encryptedText: string, key: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error('Invalid encrypted text format');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  static generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  static createHMAC(data: string, key: string): string {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  static constantTimeEquals(a: string, b: string): boolean {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  }
}
