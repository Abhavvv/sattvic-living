class SlidingWindowLimiter {
  private windowMs: number;
  private maxRequests: number;
  private hits: Map<string, number[]>;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.hits = new Map();
  }

  /**
   * Checks if the key has exceeded the maximum allowable requests within the sliding window.
   * If limited, returns true. Otherwise, logs the attempt and returns false.
   */
  public isRateLimited(key: string): boolean {
    const now = Date.now();
    const timestamps = this.hits.get(key) || [];

    // Filter out timestamps that have aged past the sliding window windowMs
    const activeHits = timestamps.filter((time) => now - time < this.windowMs);

    if (activeHits.length >= this.maxRequests) {
      return true;
    }

    // Add current timestamp and store
    activeHits.push(now);
    this.hits.set(key, activeHits);
    return false;
  }

  /**
   * Resets hit counters for a specific key (useful after a successful login).
   */
  public reset(key: string): void {
    this.hits.delete(key);
  }
}

// Attach to global scope to prevent Hot Module Reload (HMR) resets during local development
declare global {
  // eslint-disable-next-line no-var
  var globalLoginLimiter: SlidingWindowLimiter | undefined;
  // eslint-disable-next-line no-var
  var globalEmailVerifyLimiter: SlidingWindowLimiter | undefined;
  // eslint-disable-next-line no-var
  var globalPasswordResetLimiter: SlidingWindowLimiter | undefined;
  // eslint-disable-next-line no-var
  var globalRegisterLimiter: SlidingWindowLimiter | undefined;
  // eslint-disable-next-line no-var
  var globalBookingLimiter: SlidingWindowLimiter | undefined;
}

export const loginLimiter =
  globalThis.globalLoginLimiter || new SlidingWindowLimiter(60 * 1000, 5); // Max 5 requests per 60 seconds

export const emailVerifyLimiter =
  globalThis.globalEmailVerifyLimiter || new SlidingWindowLimiter(10 * 60 * 1000, 3); // Max 3 requests per 10 minutes

export const passwordResetLimiter =
  globalThis.globalPasswordResetLimiter || new SlidingWindowLimiter(10 * 60 * 1000, 3); // Max 3 requests per 10 minutes

export const registerLimiter =
  globalThis.globalRegisterLimiter || new SlidingWindowLimiter(10 * 60 * 1000, 3); // Max 3 requests per 10 minutes

export const bookingLimiter =
  globalThis.globalBookingLimiter || new SlidingWindowLimiter(60 * 1000, 10); // Max 10 requests per minute

if (process.env.NODE_ENV !== "production") {
  globalThis.globalLoginLimiter = loginLimiter;
  globalThis.globalEmailVerifyLimiter = emailVerifyLimiter;
  globalThis.globalPasswordResetLimiter = passwordResetLimiter;
  globalThis.globalRegisterLimiter = registerLimiter;
  globalThis.globalBookingLimiter = bookingLimiter;
}
