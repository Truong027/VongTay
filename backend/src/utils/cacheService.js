/**
 * High-Performance In-Memory & Redis-Ready Cache Service
 * Provides sub-millisecond response times for read-heavy operations,
 * protecting Neon DB connection pool under high traffic (10,000+ users).
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      clears: 0
    };

    // Automatic background garbage collection every 60 seconds
    if (typeof setInterval !== 'undefined') {
      this.cleanupTimer = setInterval(() => this.cleanup(), 60000);
      if (this.cleanupTimer.unref) {
        this.cleanupTimer.unref(); // Do not block Node process exit
      }
    }
  }

  /**
   * Get value from cache by key
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    if (!key) return null;
    const item = this.cache.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check expiration
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value;
  }

  /**
   * Store value in cache with TTL (Time To Live in seconds)
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds - Default: 120s
   */
  set(key, value, ttlSeconds = 120) {
    if (!key) return;
    
    // Safety cap: Max 10,000 keys in memory to prevent heap leak
    if (this.cache.size > 10000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const expiresAt = ttlSeconds > 0 ? Date.now() + (ttlSeconds * 1000) : null;
    this.cache.set(key, { value, expiresAt, createdAt: Date.now() });
    this.stats.sets++;
  }

  /**
   * Delete a specific key
   * @param {string} key
   */
  delete(key) {
    if (!key) return;
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix or pattern
   * E.g. invalidatePrefix('products:') removes all product cache keys
   * @param {string} prefix
   */
  invalidatePrefix(prefix) {
    if (!prefix) return;
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.stats.clears++;
  }

  /**
   * Background sweep to remove expired items
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Helper: wrap an async query function with caching
   * @param {string} key
   * @param {number} ttlSeconds
   * @param {Function} fetchFn
   */
  async wrap(key, ttlSeconds, fetchFn) {
    const cached = this.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const fresh = await fetchFn();
    if (fresh !== undefined && fresh !== null) {
      this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }

  getStats() {
    return {
      size: this.cache.size,
      ...this.stats
    };
  }
}

export const cacheService = new CacheService();
