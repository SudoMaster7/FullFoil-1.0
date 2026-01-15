import API_BASE from '../config/api.js';
import cacheService from './cacheService';

// Flesh and Blood (FAB) Service
class FABService {
    constructor() {
        this.apiBase = `${API_BASE}/fab`;
    }

    async searchCards(filters = {}, page = 1) {
        const cacheKey = cacheService.generateKey('fab:search', { filters, page });
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams();

            if (filters.class) {
                params.append('class', filters.class);
            }
            if (filters.type) {
                params.append('type', filters.type);
            }
            if (filters.rarity && filters.rarity.length > 0) {
                params.append('rarity', filters.rarity.join(','));
            }

            const response = await fetch(`${this.apiBase}/cards?${params}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const cards = data.data || data;
            const normalized = cards.map(card => this.normalizeCard(card));

            // Apply client-side filtering
            let filtered = normalized;
            if (filters.priceRange) {
                filtered = filtered.filter(card =>
                    card.price >= filters.priceRange.min &&
                    card.price <= filters.priceRange.max
                );
            }

            // Pagination
            const pageSize = 20;
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedCards = filtered.slice(startIndex, endIndex);

            const result = {
                cards: paginatedCards,
                hasMore: endIndex < filtered.length,
                totalCards: filtered.length
            };

            cacheService.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('FAB API error:', error);
            throw new Error(`Erro ao buscar cartas Flesh and Blood: ${error.message}`);
        }
    }

    async getRandomCards(count = 12) {
        const cacheKey = cacheService.generateKey('fab:random', { count });
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${this.apiBase}/cards/random?count=${count}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const cards = data.data || data;
            const normalized = cards.map(card => this.normalizeCard(card));

            const result = {
                cards: normalized,
                hasMore: false,
                totalCards: count
            };

            cacheService.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('FAB random API error:', error);
            throw new Error(`Erro ao buscar cartas Flesh and Blood: ${error.message}`);
        }
    }

    normalizeCard(rawCard) {
        return {
            id: rawCard.unique_id || rawCard.id,
            name: rawCard.name,
            game: 'fab',
            set: rawCard.set_printing_unique_id || rawCard.set || 'Unknown',
            condition: 'NM',
            rarity: rawCard.rarities?.[0] || rawCard.rarity || 'Common',
            price: this.extractPrice(rawCard),
            colors: [],
            type: this.normalizeType(rawCard.type_text || rawCard.types?.[0]),
            image: rawCard.image_url || '',
            imageSmall: rawCard.image_url || ''
        };
    }

    normalizeType(type) {
        const typeMap = {
            'Action': 'Ação',
            'Attack Action': 'Ataque',
            'Defense Reaction': 'Defesa',
            'Instant': 'Instantâneo',
            'Equipment': 'Equipamento',
            'Weapon': 'Arma',
            'Hero': 'Herói'
        };
        return typeMap[type] || type || 'Desconhecido';
    }

    extractPrice(rawCard) {
        if (rawCard.price) return parseFloat(rawCard.price);

        // Generate realistic price based on rarity
        const rarityPrices = {
            'Common': [0.10, 0.50],
            'Rare': [0.50, 3],
            'Super Rare': [3, 15],
            'Majestic': [10, 50],
            'Legendary': [20, 200],
            'Fabled': [100, 1000]
        };
        const rarity = rawCard.rarities?.[0] || 'Common';
        const range = rarityPrices[rarity] || [0.5, 5];
        return parseFloat((Math.random() * (range[1] - range[0]) + range[0]).toFixed(2));
    }
}

const fabService = new FABService();
export default fabService;
