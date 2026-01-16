class Listing {
    constructor({
        sellerId,
        cardId,
        cardData,
        quantity,
        condition,
        language,
        foil,
        price,
        id = null
    }) {
        this.id = id || this.generateId();
        this.sellerId = sellerId;
        this.cardId = cardId; // ID from external API
        this.cardData = {
            name: cardData.name,
            game: cardData.game,
            set: cardData.set || '',
            number: cardData.number || '',
            rarity: cardData.rarity || '',
            imageUrl: cardData.imageUrl || cardData.image || '',
            type: cardData.type || ''
        };
        this.quantity = quantity || 1;
        this.condition = condition || 'near_mint';
        this.language = language || 'en';
        this.foil = foil || false;
        this.price = parseFloat(price);
        this.status = quantity > 0 ? 'active' : 'sold_out';
        this.views = 0;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    generateId() {
        return `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
            cardId: this.cardId,
            cardData: this.cardData,
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
