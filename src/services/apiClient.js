// Base API Client with retry and rate limiting
class APIClient {
    constructor(baseURL, options = {}) {
        this.baseURL = baseURL;
        this.delayMs = options.delayMs || 200;
        this.maxRetries = options.maxRetries || 3;
        this.timeout = options.timeout || 10000;
        this.headers = options.headers || {};
        this.lastRequestTime = 0;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async get(endpoint, params = {}) {
        const url = new URL(endpoint, this.baseURL);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });

        return this.fetchWithRetry(url.toString());
    }

    async fetchWithRetry(url) {
        let lastError;

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                // Rate limiting: ensure minimum delay between requests
                const now = Date.now();
                const timeSinceLastRequest = now - this.lastRequestTime;
                if (timeSinceLastRequest < this.delayMs) {
                    await this.delay(this.delayMs - timeSinceLastRequest);
                }
                this.lastRequestTime = Date.now();

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        ...this.headers
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                lastError = error;

                // Detect specific error types
                if (error.name === 'AbortError') {
                    console.warn(`Request timeout after ${this.timeout}ms: ${url}`);
                } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    console.warn(`Network/CORS error: ${url}`, error);
                } else {
                    console.warn(`Attempt ${attempt + 1} failed:`, error.message);
                }

                if (attempt < this.maxRetries - 1) {
                    await this.delay(1000 * (attempt + 1));
                }
            }
        }

        throw lastError;
    }
}

export default APIClient;
