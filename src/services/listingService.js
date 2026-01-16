import API_BASE from '../config/api';

const LISTINGS_API = `${API_BASE}/listings`;

/**
 * Create a new listing
 */
export async function createListing(listingData, token) {
    const response = await fetch(LISTINGS_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(listingData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar listing');
    }

    return data.listing;
}

/**
 * Get all listings with filters
 */
export async function getAllListings(filters = {}) {
    const params = new URLSearchParams(filters);
    const url = params.toString() ? `${LISTINGS_API}?${params}` : LISTINGS_API;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar listings');
    }

    return data.listings;
}

/**
 * Search listings by card ID
 */
export async function searchListingsByCard(cardId, filters = {}) {
    const params = new URLSearchParams(filters);
    const url = params.toString()
        ? `${LISTINGS_API}/search/card/${cardId}?${params}`
        : `${LISTINGS_API}/search/card/${cardId}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar listings');
    }

    return data.listings;
}

/**
 * Get listing by ID
 */
export async function getListing(listingId) {
    const response = await fetch(`${LISTINGS_API}/${listingId}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar listing');
    }

    return data.listing;
}

/**
 * Update listing
 */
export async function updateListing(listingId, updates, token) {
    const response = await fetch(`${LISTINGS_API}/${listingId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar listing');
    }

    return data.listing;
}

/**
 * Delete listing
 */
export async function deleteListing(listingId, token) {
    const response = await fetch(`${LISTINGS_API}/${listingId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao deletar listing');
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
