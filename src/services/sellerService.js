/**
 * Seller Service - FullFoil
 * 
 * Handles seller accounts via Django catalog API.
 */

import { API_URLS } from '../config/api';
import authService from './authService';

const SELLERS_API = `${API_URLS.CATALOG}/sellers`;

/**
 * Create a new seller account
 */
export async function createSeller(sellerData) {
    const token = authService.getToken();

    const response = await fetch(`${SELLERS_API}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sellerData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao criar conta de vendedor');
    }

    return data;
}

/**
 * Get current user's seller account
 */
export async function getMySeller() {
    const token = authService.getToken();

    // Django doesn't have a /me endpoint for sellers yet
    // This would need custom implementation
    const response = await fetch(`${SELLERS_API}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar conta de vendedor');
    }

    // Filter to find current user's seller profile
    const sellers = data.results || data;
    // For now, return first seller (mock behavior)
    return sellers.length > 0 ? sellers[0] : null;
}

/**
 * Get all sellers (public)
 */
export async function getAllSellers() {
    const response = await fetch(`${SELLERS_API}/`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar vendedores');
    }

    return data.results || data;
}

/**
 * Get seller by ID (public)
 */
export async function getSeller(sellerId) {
    const response = await fetch(`${SELLERS_API}/${sellerId}/`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar vendedor');
    }

    return data;
}

/**
 * Update seller
 */
export async function updateSeller(sellerId, updates) {
    const token = authService.getToken();

    const response = await fetch(`${SELLERS_API}/${sellerId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao atualizar vendedor');
    }

    return data;
}

/**
 * Get seller statistics
 */
export async function getSellerStats(sellerId) {
    const response = await fetch(`${SELLERS_API}/${sellerId}/listings/`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar estatísticas');
    }

    // Calculate stats from listings
    const listings = data.results || data;
    return {
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'active').length,
    };
}

export default {
    createSeller,
    getMySeller,
    getAllSellers,
    getSeller,
    updateSeller,
    getSellerStats
};
