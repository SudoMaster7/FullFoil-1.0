import API_BASE from '../config/api.js';
import cacheService from './cacheService';

// One Piece Card Game Service (via OPTCG API)
class OnePieceService {
    constructor() {
        this.apiBase = `${API_BASE}/onepiece`;
    }

    async searchCards(filters = {}, page = 1) {
        const cacheKey = cacheService.generateKey('onepiece:search', { filters, page });
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: '20'
            });

            if (filters.color && filters.color.length > 0) {
                params.append('color', filters.color.join(','));
            }
            if (filters.type && filters.type.length > 0) {
                params.append('type', filters.type.join(','));
            }
            if (filters.rarity && filters.rarity.length > 0) {
                params.append('rarity', filters.rarity.join(','));
            }

            const response = await fetch(`${this.apiBase}/cards?${params}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const cards = data.cards || [];
            let normalized = cards.map(card => this.normalizeCard(card));

            // Apply price filter client-side
            if (filters.priceRange) {
                normalized = normalized.filter(card =>
                    card.price >= filters.priceRange.min &&
                    card.price <= filters.priceRange.max
                );
            }

            const result = {
                cards: normalized,
                hasMore: data.pagination?.hasMore || false,
                totalCards: data.pagination?.total || normalized.length
            };

            cacheService.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('One Piece API error:', error);
            throw new Error(`Erro ao buscar cartas One Piece: ${error.message}`);
        }
    }

    async getRandomCards(count = 12) {
        // Ensure count does not exceed 50
        const actualCount = Math.min(count, 50);
        const cacheKey = cacheService.generateKey('onepiece:random', { count: actualCount });
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${this.apiBase}/cards/random?count=${actualCount}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const cards = data.cards || [];
            const normalized = cards.map(card => this.normalizeCard(card));

            const result = {
                cards: normalized,
                hasMore: false,
                totalCards: actualCount
            };

            cacheService.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('One Piece random API error:', error);
            throw new Error(`Erro ao buscar cartas One Piece: ${error.message}`);
        }
    }

    normalizeCard(rawCard) {
        return {
            id: rawCard.card_id || rawCard.id,
            name: rawCard.card_name || rawCard.name,
            game: 'onepiece',
            set: rawCard.set_name || 'Unknown',
            condition: 'NM',
            rarity: rawCard.rarity || 'Common',
            price: this.extractPrice(rawCard),
            colors: rawCard.card_color ? [rawCard.card_color] : [],
            type: rawCard.card_type || 'Unknown',
            image: rawCard.card_image || '',
            imageSmall: rawCard.card_image || ''
        };
    }

    extractPrice(rawCard) {
        // Try API prices with validation
        if (rawCard.market_price && parseFloat(rawCard.market_price) > 0) {
            return parseFloat(rawCard.market_price);
        }
        if (rawCard.inventory_price && parseFloat(rawCard.inventory_price) > 0) {
            return parseFloat(rawCard.inventory_price);
        }

        // Generate realistic price based on rarity
        const rarityPrices = {
            'C': [0.25, 1.5],
            'UC': [0.50, 2.5],
            'R': [1, 5],
            'SR': [3, 15],
            'SEC': [10, 50],
            'L': [5, 30],
            'Common': [0.25, 1.5],
            'Uncommon': [0.50, 2.5],
            'Rare': [1, 5],
            'Super Rare': [3, 15],
            'Secret Rare': [10, 50],
            'Special Illustration Rare': [20, 80],
            'Hyper Rare': [30, 120],
            'Leader': [5, 30]
        };
        const range = rarityPrices[rawCard.rarity] || [1, 10];
        return parseFloat((Math.random() * (range[1] - range[0]) + range[0]).toFixed(2));
    }
}

const onePieceService = new OnePieceService();
export default onePieceService;
