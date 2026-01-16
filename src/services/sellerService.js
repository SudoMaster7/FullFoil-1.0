import API_BASE from '../config/api';

const SELLERS_API = `${API_BASE}/sellers`;

/**
 * Create a new seller account
 */
export async function createSeller(sellerData, token) {
    const response = await fetch(SELLERS_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sellerData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta de vendedor');
    }

    return data;
}

/**
 * Get current user's seller account
 */
export async function getMySeller(token) {
    const response = await fetch(`${SELLERS_API}/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 404) {
            return null; // User doesn't have a seller account
        }
        throw new Error(data.message || 'Erro ao buscar conta de vendedor');
    }

    return data.seller;
}

/**
 * Get all sellers (public)
 */
export async function getAllSellers(status = 'active') {
    const url = status ? `${SELLERS_API}?status=${status}` : SELLERS_API;
    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar vendedores');
    }

    return data.sellers;
}

/**
 * Get seller by ID (public)
 */
export async function getSeller(sellerId) {
    const response = await fetch(`${SELLERS_API}/${sellerId}`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar vendedor');
    }

    return data.seller;
}

/**
 * Update seller
 */
export async function updateSeller(sellerId, updates, token) {
    const response = await fetch(`${SELLERS_API}/${sellerId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar vendedor');
    }

    return data.seller;
}

/**
 * Get seller statistics
 */
export async function getSellerStats(sellerId) {
    const response = await fetch(`${SELLERS_API}/${sellerId}/stats`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar estatísticas');
    }

    return data.stats;
}

export default {
    createSeller,
    getMySeller,
    getAllSellers,
    getSeller,
    updateSeller,
    getSellerStats
};
