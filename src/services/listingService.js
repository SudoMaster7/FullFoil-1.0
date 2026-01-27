/**
 * Listing Service - FullFoil
 * 
 * Handles marketplace listings via Django catalog API.
 */

import { API_URLS } from '../config/api';
import authService from './authService';

const LISTINGS_API = `${API_URLS.CATALOG}/listings`;
const CARDS_API = `${API_URLS.CATALOG}/cards`;

/**
 * Create a new listing
 */
export async function createListing(listingData) {
    const token = authService.getToken();

    const response = await fetch(`${LISTINGS_API}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(listingData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || data.message || 'Erro ao criar listing');
    }

    return data;
}

/**
 * Get all listings with filters
 */
export async function getAllListings(filters = {}) {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
            params.append(key, filters[key]);
        }
    });

    const url = params.toString() ? `${LISTINGS_API}/?${params}` : `${LISTINGS_API}/`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar listings');
    }

    // Handle DRF pagination response
    return data.results || data;
}

/**
 * Search listings by card ID (uses canonical catalog)
 */
export async function searchListingsByCard(cardProductId, filters = {}) {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
            params.append(key, filters[key]);
        }
    });

    const url = params.toString()
        ? `${CARDS_API}/${cardProductId}/listings/?${params}`
        : `${CARDS_API}/${cardProductId}/listings/`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar listings');
    }

    return data.listings || data.results || data;
}

/**
 * Get listing by ID
 */
export async function getListing(listingId) {
    const response = await fetch(`${LISTINGS_API}/${listingId}/`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar listing');
    }

    return data;
}

/**
 * Update listing
 */
export async function updateListing(listingId, updates) {
    const token = authService.getToken();

    const response = await fetch(`${LISTINGS_API}/${listingId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao atualizar listing');
    }

    return data;
}

/**
 * Delete listing
 */
export async function deleteListing(listingId) {
    const token = authService.getToken();

    const response = await fetch(`${LISTINGS_API}/${listingId}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Erro ao deletar listing');
    }

    return true;
}

export default {
    createListing,
    getAllListings,
    searchListingsByCard,
    getListing,
    updateListing,
    deleteListing
};
