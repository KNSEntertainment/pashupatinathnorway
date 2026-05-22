// Server-side captcha storage for secure verification
// Using a global object to persist across serverless function invocations
import { randomBytes } from 'crypto';

interface CaptchaData {
  answer: string;
  expiresAt: number;
  question: string;
}

class CaptchaStore {
  private store: Map<string, CaptchaData>;

  constructor() {
    // Use global store to persist across invocations
    const globalWithStore = global as unknown as { captchaStore?: Map<string, CaptchaData> };
    if (!globalWithStore.captchaStore) {
      globalWithStore.captchaStore = new Map();
    }
    this.store = globalWithStore.captchaStore;
    
    // Clean up expired captchas
    this.cleanup();
  }

  generateToken(): string {
    // Generate a secure random token
    return randomBytes(32).toString('hex');
  }

  storeCaptcha(token: string, question: string, answer: string): void {
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    this.store.set(token, {
      answer,
      expiresAt,
      question
    });
  }

  verifyCaptcha(token: string, userAnswer: string): boolean {
    const data = this.store.get(token);
    
    if (!data) {
      return false; // Token not found
    }

    if (Date.now() > data.expiresAt) {
      this.store.delete(token);
      return false; // Expired
    }

    // Remove the token after verification to prevent replay attacks
    this.store.delete(token);

    return userAnswer.trim() === data.answer;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [token, data] of this.store.entries()) {
      if (now > data.expiresAt) {
        this.store.delete(token);
      }
    }
  }

  // For debugging/testing purposes
  getStoreSize(): number {
    return this.store.size;
  }

  // For debugging - list all stored tokens
  debugStore(): void {
    console.log("Current store contents:");
    for (const [token, data] of this.store.entries()) {
      console.log(`Token: ${token.substring(0, 8)}..., Answer: ${data.answer}, Expires: ${new Date(data.expiresAt).toISOString()}`);
    }
  }
}

// Export a singleton instance
export const captchaStore = new CaptchaStore();
