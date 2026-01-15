import NodeCache from 'node-cache';

// Cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const getCache = (key) => {
    return cache.get(key);
};

export const setCache = (key, value) => {
    return cache.set(key, value);
};

export const generateCacheKey = (prefix, params) => {
    const paramStr = JSON.stringify(params);
    return `${prefix}:${paramStr}`;
};

export default { getCache, setCache, generateCacheKey };
