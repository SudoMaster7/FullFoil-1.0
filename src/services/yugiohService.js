import API_BASE from '../config/api.js';
import cacheService from './cacheService';

// Yu-Gi-Oh Service (via Backend Proxy)
class YugiohService {
    constructor() {
        this.apiBase = `${API_BASE}/yugioh`;
    }

    async searchCards(filters = {}, page = 1) {
        const cacheKey = cacheService.generateKey('yugioh:search', { filters, page });
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams();

            // API filters
            if (filters.type && filters.type.length > 0) {
                params.append('type', filters.type[0]);
            }
            if (filters.race) {
                params.append('race', filters.race);
            }

            const response = await fetch(`${this.apiBase}/cards?${params}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const cards = data.data || [];
            let normalized = cards.map(card => this.normalizeCard(card));

            // Apply filters client-side
            if (filters.rarity && filters.rarity.length > 0) {
                normalized = normalized.filter(card =>
                    filters.rarity.includes(card.rarity)
                );
            }

            if (filters.priceRange) {
                normalized = normalized.filter(card =>
                    card.price >= filters.priceRange.min &&
                    card.price <= filters.priceRange.max
                );
            }

            // Pagination with increased page size
            const pageSize = 50; // Increased from 20 to 50
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedCards = normalized.slice(startIndex, endIndex);

            const result = {
                cards: paginatedCards,
                hasMore: endIndex < normalized.length,
                totalCards: normalized.length
            };

            cacheService.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Yu-Gi-Oh API error:', error);
            throw new Error(`Erro ao buscar cartas Yu-Gi-Oh: ${error.message}`);
        }
    }

    async getRandomCards(count = 12) {
        const cacheKey = cacheService.generateKey('yugioh:random', { count });
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
            console.error('Yu-Gi-Oh random API error:', error);
            throw new Error(`Erro ao buscar cartas Yu-Gi-Oh: ${error.message}`);
        }
    }

    normalizeCard(rawCard) {
        const cardSet = rawCard.card_sets?.[0] || {};
        const cardImage = rawCard.card_images?.[0] || {};

        return {
            id: rawCard.id?.toString() || '',
            name: rawCard.name,
            game: 'yugioh',
            set: cardSet.set_name || 'Unknown',
            condition: 'NM',
            rarity: cardSet.set_rarity || this.extractRarity(rawCard),
            price: this.extractPrice(cardSet, rawCard),
            colors: [],
            type: this.normalizeType(rawCard.race || rawCard.type),
            image: cardImage.image_url || '',
            imageSmall: cardImage.image_url_small || cardImage.image_url || ''
        };
    }

    extractRarity(rawCard) {
        if (rawCard.rarity) return rawCard.rarity;
        const frameType = rawCard.frameType || '';
        if (frameType.includes('xyz')) return 'Ultra Rare';
        if (frameType.includes('synchro')) return 'Super Rare';
        return 'Common';
    }

    extractPrice(cardSet, rawCard) {
        // Try set price first
        if (cardSet.set_price && parseFloat(cardSet.set_price) > 0) {
            return parseFloat(cardSet.set_price);
        }

        // Try card prices
        const prices = rawCard.card_prices?.[0] || {};
        if (prices.tcgplayer_price && parseFloat(prices.tcgplayer_price) > 0) {
            return parseFloat(prices.tcgplayer_price);
        }
        if (prices.cardmarket_price && parseFloat(prices.cardmarket_price) > 0) {
            return parseFloat(prices.cardmarket_price);
        }

        // Fallback based on rarity
        const rarity = cardSet.set_rarity || 'Common';
        const rarityPrices = {
            'Common': [0.25, 1.50],
            'Rare': [1, 5],
            'Super Rare': [3, 15],
            'Ultra Rare': [10, 40],
            'Secret Rare': [20, 100],
            'Starlight Rare': [100, 500]
        };
        const range = rarityPrices[rarity] || [0.5, 3];
        return parseFloat((Math.random() * (range[1] - range[0]) + range[0]).toFixed(2));
    }

    normalizeType(type) {
        const typeMap = {
            'Dragon': 'Dragão',
            'Spellcaster': 'Mago',
            'Warrior': 'Guerreiro',
            'Fiend': 'Demônio',
            'Zombie': 'Zumbi',
            'Machine': 'Máquina',
            'Aqua': 'Aquático',
            'Pyro': 'Fogo',
            'Rock': 'Rocha',
            'Winged Beast': 'Besta Alada',
            'Plant': 'Planta',
            'Insect': 'Inseto',
            'Thunder': 'Trovão',
            'Beast': 'Besta',
            'Beast-Warrior': 'Besta-Guerreiro',
            'Dinosaur': 'Dinossauro',
            'Fish': 'Peixe',
            'Sea Serpent': 'Serpente Marinha',
            'Reptile': 'Réptil',
            'Psychic': 'Psíquico',
            'Divine-Beast': 'Besta Divina',
            'Creator God': 'Deus Criador',
            'Wyrm': 'Wyrm',
            'Cyberse': 'Cibernético'
        };
        return typeMap[type] || type || 'Desconhecido';
    }
}

const yugiohService = new YugiohService();
export default yugiohService;
