// Simple in-memory cache with TTL
class CacheService {
    constructor(ttlMinutes = 5) {
        this.cache = new Map();
        this.ttl = ttlMinutes * 60 * 1000;
    }

    generateKey(prefix, params) {
        return `${prefix}:${JSON.stringify(params)}`;
    }

    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        // Check if cache has expired
        if (Date.now() - cached.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        return cached.value;
    }

    clear() {
        this.cache.clear();
    }

    // Get cache stats for debugging
    getStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }
}

// Export singleton instance
const cacheService = new CacheService(5); // 5 minutes TTL
export default cacheService;
