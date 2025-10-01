import { NextFunction, Request, Response } from 'express';

// In-memory store for rate limiting (in production, use Redis)
export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class MemoryStore {
  private store: Map<string, RateLimitEntry> = new Map();

  increment(key: string): { count: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      const resetTime = now + 15 * 60 * 1000; // 15 minutes window
      this.store.set(key, { count: 1, resetTime });
      return { count: 1, resetTime };
    }

    entry.count++;
    this.store.set(key, entry);
    return { count: entry.count, resetTime: entry.resetTime };
  }

  decrement(key: string): void {
    const entry = this.store.get(key);
    if (entry && entry.count > 0) {
      entry.count--;
      if (entry.count === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, entry);
      }
    }
  }
}

const store = new MemoryStore();

export interface RateLimitConfig {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Max requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

export const createRateLimit = (config: RateLimitConfig = {}) => {
   const {
    //  windowMs = 15 * 60 * 1000, // 15 minutes
     maxRequests = 100, // 100 requests per window
     skipSuccessfulRequests = false,
  //    skipFailedRequests = false,
     message = 'Too many requests, please try again later.',
     standardHeaders = true,
     legacyHeaders = false,
   } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    // Generate key based on IP and optionally user ID
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const userKey = req.headers.authorization ? `${key}:authenticated` : `${key}:anonymous`;

    const { count, resetTime } = store.increment(userKey);

    // Set headers
    if (standardHeaders) {
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, maxRequests - count).toString(),
        'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
      });
    }

    if (legacyHeaders) {
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, maxRequests - count).toString(),
        'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
      });
    }

    if (count > maxRequests) {
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      });
      return;
    }

    // Optional: decrement on successful response
    if (skipSuccessfulRequests) {
      const originalSend = res.send.bind(res);
      res.send = (data: any) => {
        if (res.statusCode < 400) {
          store.decrement(userKey);
        }
        return originalSend(data);
      };
    }

    next();
  };
};

// Pre-configured rate limiters
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.',
});

export const strictRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 20 requests per 15 minutes
  message: 'Rate limit exceeded for this endpoint.',
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
});
