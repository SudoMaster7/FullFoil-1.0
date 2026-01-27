/**
 * API Configuration - FullFoil
 * 
 * Centralized API base URL configuration.
 * Uses VITE_API_URL from .env file.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Sub-paths for different API sections
export const API_URLS = {
    BASE: API_BASE,
    AUTH: `${API_BASE}/auth`,
    CATALOG: `${API_BASE}/catalog`,
    USERS: `${API_BASE}/users`,
};

export default API_BASE;
