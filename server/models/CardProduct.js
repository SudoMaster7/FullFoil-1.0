/**
 * CardProduct Model - Canonical Card Catalog
 * 
 * This represents the global, read-only card database.
 * Sellers do NOT create CardProducts - they attach inventory (Listings) to existing cards.
 * CardProducts are populated from external APIs (Scryfall, YGOPRODECK, etc.)
 */

class CardProduct {
    constructor({
        externalId,     // ID from external API (Scryfall UUID, YGOPRODECK ID, etc.)
        name,
        game,           // magic, pokemon, yugioh, lorcana, onepiece
        set,            // Set/Expansion name
        setCode,        // Set code (e.g., "LCI" for Lost Caverns of Ixalan)
        number,         // Card number in set
        rarity,
        type,           // Card type (Creature, Spell, Trainer, etc.)
        imageUrl,
        imageUrlHiRes,  // High-resolution image
        artist,
        text,           // Card text/effect
        attributes,     // Game-specific attributes (power/toughness, HP, attack/defense)
        id = null
    }) {
        // Generate canonical ID: card_{game}_{externalId}
        this.id = id || `card_${game}_${externalId}`;
        this.externalId = externalId;
        this.name = name;
        this.game = game;
        this.set = set || '';
        this.setCode = setCode || '';
        this.number = number || '';
        this.rarity = this.normalizeRarity(rarity);
        this.type = type || '';
        this.imageUrl = imageUrl || '';
        this.imageUrlHiRes = imageUrlHiRes || imageUrl || '';
        this.artist = artist || '';
        this.text = text || '';
        this.attributes = attributes || {};

        // Market Price Intelligence
        this.marketPrice = null;        // 7-day average
        this.lowPrice = null;           // Lowest recent sale
        this.highPrice = null;          // Highest recent sale
        this.foilMarketPrice = null;    // Foil 7-day average
        this.priceUpdatedAt = null;

        // Metadata
        this.totalListings = 0;         // Count of active listings
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Normalize rarity across different games to common values
     */
    normalizeRarity(rarity) {
        if (!rarity) return 'common';

        const rarityLower = rarity.toLowerCase();

        // Map various game-specific rarities to normalized values
        const rarityMap = {
            // Common
            'common': 'common',
            // Uncommon
            'uncommon': 'uncommon',
            // Rare
            'rare': 'rare',
            'rare holo': 'rare',
            'super rare': 'rare',
            // Mythic/Ultra Rare
            'mythic': 'mythic',
            'mythic rare': 'mythic',
            'ultra rare': 'ultra_rare',
            'secret rare': 'secret_rare',
            // Special
            'special': 'special',
            'promo': 'special'
        };

        return rarityMap[rarityLower] || rarityLower;
    }

    /**
     * Update market prices
     */
    updatePrices({ marketPrice, lowPrice, highPrice, foilMarketPrice }) {
        if (marketPrice !== undefined) this.marketPrice = marketPrice;
        if (lowPrice !== undefined) this.lowPrice = lowPrice;
        if (highPrice !== undefined) this.highPrice = highPrice;
        if (foilMarketPrice !== undefined) this.foilMarketPrice = foilMarketPrice;
        this.priceUpdatedAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    /**
     * JSON serialization
     */
    toJSON() {
        return {
            id: this.id,
            externalId: this.externalId,
            name: this.name,
            game: this.game,
            set: this.set,
            setCode: this.setCode,
            number: this.number,
            rarity: this.rarity,
            type: this.type,
            imageUrl: this.imageUrl,
            imageUrlHiRes: this.imageUrlHiRes,
            artist: this.artist,
            text: this.text,
            attributes: this.attributes,
            marketPrice: this.marketPrice,
            lowPrice: this.lowPrice,
            highPrice: this.highPrice,
            foilMarketPrice: this.foilMarketPrice,
            priceUpdatedAt: this.priceUpdatedAt,
            totalListings: this.totalListings,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Create CardProduct from Scryfall API response
     */
    static fromScryfall(data) {
        return new CardProduct({
            externalId: data.id,
            name: data.name,
            game: 'magic',
            set: data.set_name,
            setCode: data.set,
            number: data.collector_number,
            rarity: data.rarity,
            type: data.type_line,
            imageUrl: data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal || '',
            imageUrlHiRes: data.image_uris?.large || data.card_faces?.[0]?.image_uris?.large || '',
            artist: data.artist,
            text: data.oracle_text,
            attributes: {
                manaCost: data.mana_cost,
                cmc: data.cmc,
                colors: data.colors,
                power: data.power,
                toughness: data.toughness
            }
        });
    }

    /**
     * Create CardProduct from Pokemon TCG API response
     */
    static fromPokemonTCG(data) {
        return new CardProduct({
            externalId: data.id,
            name: data.name,
            game: 'pokemon',
            set: data.set?.name || '',
            setCode: data.set?.id || '',
            number: data.number,
            rarity: data.rarity,
            type: data.supertype,
            imageUrl: data.images?.small || '',
            imageUrlHiRes: data.images?.large || '',
            artist: data.artist,
            text: data.flavorText || '',
            attributes: {
                hp: data.hp,
                types: data.types,
                attacks: data.attacks,
                weaknesses: data.weaknesses
            }
        });
    }

    /**
     * Create CardProduct from YGOPRODECK API response
     */
    static fromYGOPRODECK(data) {
        const cardImage = data.card_images?.[0] || {};
        return new CardProduct({
            externalId: data.id?.toString(),
            name: data.name,
            game: 'yugioh',
            set: data.card_sets?.[0]?.set_name || '',
            setCode: data.card_sets?.[0]?.set_code || '',
            number: data.card_sets?.[0]?.set_code || '',
            rarity: data.card_sets?.[0]?.set_rarity || '',
            type: data.type,
            imageUrl: cardImage.image_url_small || '',
            imageUrlHiRes: cardImage.image_url || '',
            artist: '',
            text: data.desc,
            attributes: {
                atk: data.atk,
                def: data.def,
                level: data.level,
                attribute: data.attribute,
                race: data.race
            }
        });
    }
}

export default CardProduct;
