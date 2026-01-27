/**
 * SaleHistory Model - Track completed sales for Market Price Intelligence
 * 
 * Records every sale for calculating market prices.
 * Used for 7-day rolling average calculations.
 */

class SaleHistory {
    constructor({
        cardProductId,
        listingId,
        sellerId,
        buyerId,
        orderId,
        price,
        quantity,
        condition,
        language,
        foil,
        id = null
    }) {
        this.id = id || `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.cardProductId = cardProductId;
        this.listingId = listingId;
        this.sellerId = sellerId;
        this.buyerId = buyerId || 'guest';
        this.orderId = orderId;
        this.price = parseFloat(price);
        this.quantity = parseInt(quantity) || 1;
        this.totalAmount = this.price * this.quantity;
        this.condition = condition;
        this.language = language || 'en';
        this.foil = foil || false;
        this.soldAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            cardProductId: this.cardProductId,
            listingId: this.listingId,
            sellerId: this.sellerId,
            buyerId: this.buyerId,
            orderId: this.orderId,
            price: this.price,
            quantity: this.quantity,
            totalAmount: this.totalAmount,
            condition: this.condition,
            language: this.language,
            foil: this.foil,
            soldAt: this.soldAt
        };
    }
}

export default SaleHistory;
