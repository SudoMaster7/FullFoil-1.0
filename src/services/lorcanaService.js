import API_BASE from '../config/api.js';
import cacheService from './cacheService';

// Lorcana Service
class LorcanaService {
    constructor() {
        this.apiBase = `${API_BASE}/lorcana`;
    }

    async searchCards(filters = {}, page = 1) {
        const cacheKey = cacheService.generateKey('lorcana:search', { filters, page });
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams({ page: page.toString() });

            // Apply filters
            if (filters.rarity && filters.rarity.length > 0) {
                params.append('rarity', filters.rarity.join(','));
            }
            if (filters.color && filters.color.length > 0) {
                params.append('color', filters.color.join(','));
            }
            if (filters.priceRange) {
                params.append('minPrice', filters.priceRange.min);
                params.append('maxPrice', filters.priceRange.max);
            }

            const response = await fetch(`${this.apiBase}/cards?${params}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const normalized = data.map(card => this.normalizeCard(card));

            // Pagination - limit to 50 cards
            const pageSize = 50;
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedCards = normalized.slice(startIndex, endIndex); // Assuming normalizedFiltered was a typo and should be normalized

            const result = {
                cards: paginatedCards,
                hasMore: endIndex < normalized.length,
                totalCards: normalized.length
            };

            cacheService.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Lorcana API error:', error);
            throw new Error(`Erro ao buscar cartas Lorcana: ${error.message}`);
        }
    }

    async getRandomCards(count = 12) {
        const cacheKey = cacheService.generateKey('lorcana:random', { count });
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${this.apiBase}/cards/random?count=${count}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const normalized = data.map(card => this.normalizeCard(card));

            const result = {
                cards: normalized,
                hasMore: false,
                totalCards: count
            };

            cacheService.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Lorcana random API error:', error);
            throw new Error(`Erro ao buscar cartas Lorcana: ${error.message}`);
        }
    }

    normalizeCard(rawCard) {
        return {
            id: rawCard.Culture_Invariant_Id || rawCard.id,
            name: rawCard.Name || rawCard.name,
            game: 'lorcana',
            set: rawCard.Set_Name || rawCard.set || 'Unknown',
            condition: 'NM',
            rarity: rawCard.Rarity || 'Common',
            price: this.extractPrice(rawCard),
            colors: [rawCard.Ink || rawCard.color || 'Unknown'],
            type: rawCard.Type || 'Character',
            image: rawCard.Image || rawCard.image_url || '',
            imageSmall: rawCard.Image || rawCard.image_url || ''
        };
    }

    extractPrice(rawCard) {
        // Try API prices first
        if (rawCard.price && parseFloat(rawCard.price) > 0) return parseFloat(rawCard.price);
        if (rawCard.market_price && parseFloat(rawCard.market_price) > 0) {
            return parseFloat(rawCard.market_price);
        }

        // Generate realistic price based on rarity
        const rarityPrices = {
            'Common': [0.25, 2],
            'Uncommon': [0.50, 3],
            'Rare': [1, 8],
            'Super Rare': [5, 20],
            'Legendary': [15, 100],
            'Enchanted': [50, 500]
        };
        const range = rarityPrices[rawCard.Rarity] || [1, 10];
        return parseFloat((Math.random() * (range[1] - range[0]) + range[0]).toFixed(2));
    }
}

const lorcanaService = new LorcanaService();
export default lorcanaService;
