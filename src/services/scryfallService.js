import APIClient from './apiClient';
import cacheService from './cacheService';

// Scryfall API Service for Magic: The Gathering
class ScryfallService {
    constructor() {
        this.client = new APIClient('https://api.scryfall.com', {
            delayMs: 100 // Scryfall recommends 50-100ms between requests
        });
    }

    async searchCards(filters = {}, page = 1) {
        const cacheKey = cacheService.generateKey('scryfall:search', { filters, page });
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        try {
            // Build Scryfall query string
            const queryParts = [];

            // Rarity filter
            if (filters.rarity && filters.rarity.length > 0) {
                const rarityQuery = filters.rarity.map(r => `r:${r.toLowerCase()}`).join(' OR ');
                queryParts.push(`(${rarityQuery})`);
            }

            // Colors filter
            if (filters.colors && filters.colors.length > 0) {
                const colorQuery = filters.colors.map(c => `c:${c}`).join('');
                queryParts.push(`color=${colorQuery}`);
            }

            // Type filter
            if (filters.types && filters.types.length > 0) {
                const typeQuery = filters.types.map(t => `t:${t}`).join(' OR ');
                queryParts.push(`(${typeQuery})`);
            }

            // Set filter
            if (filters.set) {
                queryParts.push(`s:${filters.set}`);
            }

            // Build better default query - simpler and more reliable
            const query = queryParts.length > 0 ? queryParts.join(' ') : '-t:token';

            const response = await this.client.get('/cards/search', {
                q: query,
                page,
                order: 'released'
            });

            const normalized = response.data.map(card => this.normalizeCard(card));

            // Apply client-side filters (API doesn't support these)
            let filtered = normalized;

            // Condition filter (API doesn't have this, so we skip)
            // Price range filter
            if (filters.priceRange) {
                filtered = filtered.filter(card =>
                    card.price >= filters.priceRange.min &&
                    card.price <= filters.priceRange.max
                );
            }

            // Limit to 50 cards per page
            const pageSize = 50;
            const limitedCards = filtered.slice(0, pageSize);

            const result = {
                cards: limitedCards,
                hasMore: response.has_more || filtered.length > pageSize,
                totalCards: response.total_cards
            };

            cacheService.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Scryfall API error:', error);
            throw new Error(`Erro ao buscar cartas Magic: ${error.message}`);
        }
    }

    async getRandomCards(count = 12) {
        const cacheKey = cacheService.generateKey('scryfall:random', { count });
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        try {
            const cards = [];
            for (let i = 0; i < count; i++) {
                const response = await this.client.get('/cards/random');
                cards.push(this.normalizeCard(response));
            }

            const result = {
                cards,
                hasMore: false,
                totalCards: count
            };

            cacheService.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Scryfall random API error:', error);
            throw new Error(`Erro ao buscar cartas Magic aleatórias: ${error.message}`);
        }
    }

    normalizeCard(rawCard) {
        return {
            id: rawCard.id,
            name: rawCard.name,
            game: 'magic',
            set: rawCard.set_name || 'Unknown',
            condition: 'NM', // Scryfall doesn't track condition
            rarity: this.normalizeRarity(rawCard.rarity),
            price: this.extractPrice(rawCard),
            colors: rawCard.colors || [],
            type: this.normalizeType(rawCard.type_line),
            image: rawCard.image_uris?.normal || rawCard.card_faces?.[0]?.image_uris?.normal || '',
            imageSmall: rawCard.image_uris?.small || rawCard.card_faces?.[0]?.image_uris?.small || ''
        };
    }

    extractPrice(rawCard) {
        // Try to get real price from API
        const usdPrice = rawCard.prices?.usd;
        const eurPrice = rawCard.prices?.eur;

        if (usdPrice && parseFloat(usdPrice) > 0) return parseFloat(usdPrice);
        if (eurPrice && parseFloat(eurPrice) > 0) return parseFloat(eurPrice) * 1.1; // EUR to USD aproximado

        // Fallback to rarity-based pricing
        const rarity = this.normalizeRarity(rawCard.rarity);
        const rarityPrices = {
            'Common': [0.10, 0.50],
            'Uncommon': [0.25, 1.50],
            'Rare': [0.75, 5.00],
            'Mythic': [3.00, 25.00]
        };
        const range = rarityPrices[rarity] || [0.50, 3.00];
        return parseFloat((Math.random() * (range[1] - range[0]) + range[0]).toFixed(2));
    }

    normalizeRarity(rarity) {
        const rarityMap = {
            'common': 'Common',
            'uncommon': 'Uncommon',
            'rare': 'Rare',
            'mythic': 'Mythic'
        };
        return rarityMap[rarity] || rarity;
    }

    normalizeType(typeLine) {
        if (!typeLine) return 'Desconhecido';

        const typeMap = {
            'Creature': 'Criatura',
            'Instant': 'Instantânea',
            'Sorcery': 'Feitiço',
            'Enchantment': 'Encantamento',
            'Artifact': 'Artefato',
            'Planeswalker': 'Planeswalker',
            'Land': 'Terreno'
        };

        // Extract main type
        for (const [eng, pt] of Object.entries(typeMap)) {
            if (typeLine.includes(eng)) {
                return pt;
            }
        }

        return typeLine.split('—')[0].trim();
    }
}

const scryfallService = new ScryfallService();
export default scryfallService;
