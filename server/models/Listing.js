import { generateSKU } from '../utils/skuGenerator.js';
import { isValidCondition, isValidLanguage, CONDITION } from '../constants/grading.js';

/**
 * Listing Model - Seller Inventory
 * 
 * Represents a seller's inventory attached to a CardProduct.
 * Sellers cannot create CardProducts, only Listings referencing existing ones.
 */
class Listing {
    constructor({
        sellerId,
        cardProductId,      // FK to CardProduct (canonical catalog)
        cardId,             // External API ID (for backward compatibility)
        cardData,           // Legacy: inline card data (deprecated)
        quantity,
        condition,
        language,
        foil,
        price,
        id = null
    }) {
        this.id = id || this.generateId();
        this.sellerId = sellerId;

        // Canonical reference - preferred
        this.cardProductId = cardProductId || null;

        // Legacy support for existing data
        this.cardId = cardId || null;
        this.cardData = cardData ? {
            name: cardData.name,
            game: cardData.game,
            set: cardData.set || '',
            number: cardData.number || '',
            rarity: cardData.rarity || '',
            imageUrl: cardData.imageUrl || cardData.image || '',
            type: cardData.type || ''
        } : null;

        // Standardized grading
        this.condition = this.normalizeCondition(condition);
        this.language = this.normalizeLanguage(language);
        this.foil = foil || false;

        // Generate SKU
        const skuCardId = this.cardProductId || `legacy_${cardId}`;
        this.sku = generateSKU(skuCardId, this.condition, this.language, this.foil);

        // Inventory
        this.quantity = parseInt(quantity) || 1;
        this.price = parseFloat(price);
        this.status = this.quantity > 0 ? 'active' : 'sold_out';

        // Metadata
        this.views = 0;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    generateId() {
        return `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    normalizeCondition(condition) {
        // Map various inputs to standardized values
        const conditionMap = {
            'nm': CONDITION.NM,
            'near_mint': CONDITION.NM,
            'near mint': CONDITION.NM,
            'mint': CONDITION.NM,
            'lp': CONDITION.LP,
            'lightly_played': CONDITION.LP,
            'lightly played': CONDITION.LP,
            'sp': CONDITION.LP,
            'mp': CONDITION.MP,
            'moderately_played': CONDITION.MP,
            'moderately played': CONDITION.MP,
            'hp': CONDITION.HP,
            'heavily_played': CONDITION.HP,
            'heavily played': CONDITION.HP,
            'dmg': CONDITION.DMG,
            'damaged': CONDITION.DMG
        };

        const normalized = condition?.toLowerCase() || 'near_mint';
        return conditionMap[normalized] || CONDITION.NM;
    }

    normalizeLanguage(language) {
        const langMap = {
            'english': 'en',
            'portuguese': 'pt',
            'português': 'pt',
            'spanish': 'es',
            'español': 'es',
            'japanese': 'jp',
            'korean': 'kr',
            'chinese': 'cn',
            'german': 'de',
            'french': 'fr',
            'italian': 'it'
        };

        const normalized = language?.toLowerCase() || 'en';
        return langMap[normalized] || normalized.substring(0, 2).toLowerCase();
    }

    decrementQuantity(amount = 1) {
        this.quantity = Math.max(0, this.quantity - amount);
        if (this.quantity === 0) {
            this.status = 'sold_out';
        }
        this.updatedAt = new Date().toISOString();
    }

    incrementQuantity(amount = 1) {
        this.quantity += amount;
        if (this.quantity > 0 && this.status === 'sold_out') {
            this.status = 'active';
        }
        this.updatedAt = new Date().toISOString();
    }

    updatePrice(newPrice) {
        this.price = parseFloat(newPrice);
        this.updatedAt = new Date().toISOString();
    }

    incrementViews() {
        this.views += 1;
    }

    toJSON() {
        return {
            id: this.id,
            sellerId: this.sellerId,
            cardProductId: this.cardProductId,
            cardId: this.cardId,
            cardData: this.cardData,
            sku: this.sku,
            quantity: this.quantity,
            condition: this.condition,
            language: this.language,
            foil: this.foil,
            price: this.price,
            status: this.status,
            views: this.views,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

export default Listing;
