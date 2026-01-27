/**
 * Auth Service - FullFoil
 * 
 * Handles authentication with Django + SimpleJWT backend.
 * Uses JWT token pairs (access + refresh).
 */

import { API_URLS } from '../config/api';

const TOKEN_KEY = 'fullfoil_token';
const REFRESH_TOKEN_KEY = 'fullfoil_refresh_token';
const USER_KEY = 'fullfoil_user';

/**
 * Register new user
 */
export async function register(username, email, password, firstName = '', lastName = '') {
    const response = await fetch(`${API_URLS.USERS}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            email,
            password,
            password_confirm: password,
            first_name: firstName,
            last_name: lastName
        })
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMsg = data.password?.[0] || data.username?.[0] || data.email?.[0] || data.detail || 'Erro no cadastro';
        throw new Error(errorMsg);
    }

    // Store tokens
    if (data.tokens) {
        saveTokens(data.tokens.access, data.tokens.refresh);
    }
    if (data.user) {
        saveUser(data.user);
    }

    return data;
}

/**
 * Login user - Django SimpleJWT
 */
export async function login(username, password) {
    const response = await fetch(`${API_URLS.AUTH}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Email ou senha incorretos');
    }

    // Store tokens
    saveTokens(data.access, data.refresh);

    // Fetch user profile
    const userProfile = await getMe(data.access);

    return {
        success: true,
        token: data.access,
        user: userProfile.user
    };
}

/**
 * Refresh access token
 */
export async function refreshToken() {
    const refresh = getRefreshToken();
    if (!refresh) {
        throw new Error('No refresh token');
    }

    const response = await fetch(`${API_URLS.AUTH}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
    });

    const data = await response.json();

    if (!response.ok) {
        clearTokens();
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    saveTokens(data.access, data.refresh || refresh);
    return data.access;
}

/**
 * Get current user profile
 */
export async function getMe(token) {
    const authToken = token || getToken();

    const response = await fetch(`${API_URLS.USERS}/profile/`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            // Try to refresh token
            try {
                const newToken = await refreshToken();
                return getMe(newToken);
            } catch {
                clearTokens();
                throw new Error('Sessão expirada');
            }
        }
        throw new Error(data.detail || 'Erro ao buscar perfil');
    }

    if (data.user) {
        saveUser(data.user);
    }

    return data;
}

/**
 * Update user profile
 */
export async function updateProfile(updates) {
    const token = getToken();

    const response = await fetch(`${API_URLS.USERS}/profile/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao atualizar perfil');
    }

    if (data.user) {
        saveUser(data.user);
    }

    return data;
}

/**
 * Logout - clear all stored data
 */
export function logout() {
    clearTokens();
    localStorage.removeItem(USER_KEY);
}

// Token management helpers
export function saveTokens(access, refresh) {
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
}

export function isAuthenticated() {
    return !!getToken();
}

export default {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    refreshToken,
    getToken,
    getStoredUser,
    isAuthenticated
};
