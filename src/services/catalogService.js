/**
 * Catalog Service - FullFoil
 * 
 * Handles card products from Django canonical catalog.
 * NEW: Unified card catalog from Django backend.
 */

import { API_URLS } from '../config/api';

const CARDS_API = `${API_URLS.CATALOG}/cards`;
const SETS_API = `${API_URLS.CATALOG}/sets`;
const CART_API = `${API_URLS.CATALOG}/cart`;

/**
 * Get all card products from catalog
 */
export async function getCardProducts(filters = {}) {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
            params.append(key, filters[key]);
        }
    });

    const url = params.toString() ? `${CARDS_API}/?${params}` : `${CARDS_API}/`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar cards');
    }

    return data.results || data;
}

/**
 * Get a single card product by ID
 */
export async function getCardProduct(cardId) {
    const response = await fetch(`${CARDS_API}/${cardId}/`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar card');
    }

    return data;
}

/**
 * Get listings for a specific card product
 */
export async function getCardListings(cardId, filters = {}) {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
            params.append(key, filters[key]);
        }
    });

    const url = params.toString()
        ? `${CARDS_API}/${cardId}/listings/?${params}`
        : `${CARDS_API}/${cardId}/listings/`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar listings');
    }

    return data.listings || data.results || data;
}

/**
 * Get all card sets/expansions
 */
export async function getCardSets(game = null) {
    const url = game ? `${SETS_API}/?game=${game}` : `${SETS_API}/`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar sets');
    }

    return data.results || data;
}

/**
 * Optimize cart for minimum shipping
 */
export async function optimizeCart(cartItems) {
    const response = await fetch(`${CART_API}/optimize/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: cartItems })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao otimizar carrinho');
    }

    return data;
}

/**
 * Search cards by name (uses catalog)
 */
export async function searchCards(query, game = null) {
    const params = new URLSearchParams({ search: query });
    if (game) {
        params.append('game', game);
    }

    const response = await fetch(`${CARDS_API}/?${params}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro na busca');
    }

    return data.results || data;
}

/**
 * Get price history for a card
 */
export async function getCardHistory(cardId) {
    const response = await fetch(`${CARDS_API}/${cardId}/history/`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar histórico de preços');
    }

    return data;
}

export default {
    getCardProducts,
    getCardProduct,
    getCardListings,
    getCardSets,
    optimizeCart,
    searchCards,
    getCardHistory
};
