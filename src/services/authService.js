import API_BASE from '../config/api';

const AUTH_API = `${API_BASE}/auth`;

/**
 * Register new user
 */
export async function register(email, password, name) {
    const response = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro no cadastro');
    }

    return data;
}

/**
 * Login user
 */
export async function login(email, password) {
    const response = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro no login');
    }

    return data;
}

/**
 * Get current user
 */
export async function getMe(token) {
    const response = await fetch(`${AUTH_API}/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Sessão expirada');
    }

    return data;
}

/**
 * Update user profile
 */
export async function updateProfile(token, updates) {
    const response = await fetch(`${AUTH_API}/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar perfil');
    }

    return data;
}

export default {
    register,
    login,
    getMe,
    updateProfile
};
