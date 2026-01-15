import API_BASE from '../config/api.js';
import cacheService from './cacheService';

// Pokémon TCG Service (via Backend Proxy)
class PokemonTCGService {
    constructor() {
        this.apiBase = `${API_BASE}/pokemon`;
    }

    async searchCards(filters = {}, page = 1) {
        const cacheKey = cacheService.generateKey('pokemon:search', { filters, page });
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: '20'
            });

            // Build query string for API
            const queryParts = [];

            if (filters.rarity && filters.rarity.length > 0) {
                queryParts.push(`rarity:"${filters.rarity.join('" OR rarity:"')}"`);
            }

            if (filters.type && filters.type.length > 0) {
                queryParts.push(`types:"${filters.type.join('" OR types:"')}"`);
            }

            if (queryParts.length > 0) {
                params.append('q', queryParts.join(' '));
            }

            const response = await fetch(`${this.apiBase}/cards?${params}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const cards = data.data || [];
            let normalized = cards.map(card => this.normalizeCard(card));

            // Apply price filter client-side
            if (filters.priceRange) {
                normalized = normalized.filter(card =>
                    card.price >= filters.priceRange.min &&
                    card.price <= filters.priceRange.max
                );
            }

            // Client-side Pagination - limit to 50 cards
            const pageSize = 50;
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedCards = normalized.slice(startIndex, endIndex);

            const result = {
                cards: paginatedCards,
                hasMore: endIndex < normalized.length, // Check if there are more cards in the *filtered* list
                totalCards: normalized.length // Total cards after all filters, before client-side pagination
            };

            cacheService.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Pokemon API error:', error);
            throw new Error(`Erro ao buscar cartas Pokémon: ${error.message}`);
        }
    }

    async getRandomCards(count = 12) {
        const cacheKey = cacheService.generateKey('pokemon:random', { count });
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${this.apiBase}/cards/random?count=${count}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const cards = data.data || [];
            const normalized = cards.map(card => this.normalizeCard(card));

            const result = {
                cards: normalized,
                hasMore: false,
                totalCards: count
            };

            cacheService.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Pokemon random API error:', error);
            throw new Error(`Erro ao buscar cartas Pokémon: ${error.message}`);
        }
    }

    normalizeCard(rawCard) {
        return {
            id: rawCard.id,
            name: rawCard.name,
            game: 'pokemon',
            set: rawCard.set?.name || 'Unknown',
            condition: 'NM',
            rarity: rawCard.rarity || 'Common',
            price: this.extractPrice(rawCard),
            colors: rawCard.types || [],
            type: rawCard.supertype || 'Unknown',
            image: rawCard.images?.large || rawCard.images?.small || '',
            imageSmall: rawCard.images?.small || rawCard.images?.large || ''
        };
    }

    extractPrice(rawCard) {
        const prices = rawCard.cardmarket?.prices || rawCard.tcgplayer?.prices?.normal || {};
        if (prices.averageSellPrice && parseFloat(prices.averageSellPrice) > 0) {
            return parseFloat(prices.averageSellPrice);
        }
        if (prices.market && parseFloat(prices.market) > 0) return parseFloat(prices.market);
        if (prices.mid && parseFloat(prices.mid) > 0) return parseFloat(prices.mid);

        // Fallback to generated price based on rarity
        const rarityPrices = {
            'Common': [0.25, 1],
            'Uncommon': [0.50, 2],
            'Rare': [1, 5],
            'Rare Holo': [2, 8],
            'Holo Rare': [3, 15],
            'Double Rare': [8, 30],
            'Ultra Rare': [10, 50],
            'Illustration Rare': [15, 60],
            'Special Illustration Rare': [30, 120],
            'Hyper Rare': [40, 200],
            'Secret Rare': [20, 100]
        };
        const range = rarityPrices[rawCard.rarity] || [0.5, 3];
        return parseFloat((Math.random() * (range[1] - range[0]) + range[0]).toFixed(2));
    }
}

const pokemonTCGService = new PokemonTCGService();
export default pokemonTCGService;
