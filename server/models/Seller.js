class Seller {
    constructor({
        userId,
        businessName,
        description,
        logo,
        id = null
    }) {
        this.id = id || this.generateId();
        this.userId = userId; // FK to User
        this.businessName = businessName;
        this.description = description || '';
        this.logo = logo || null;
        this.rating = 0;
        this.totalSales = 0;
        this.totalReviews = 0;
        this.commission = 12.5; // Platform commission %
        this.status = 'pending'; // pending, active, suspended
        this.settings = {
            minOrder: 0,
            shippingOptions: [],
            processingTime: '1-2 dias úteis',
            returnPolicy: 'Aceita devoluções em até 7 dias'
        };
        this.address = {
            zipCode: '',
            street: '',
            number: '',
            complement: '',
            city: '',
            state: '',
            country: 'Brasil'
        };
        this.stats = {
            activeListings: 0,
            soldItems: 0,
            totalRevenue: 0
        };
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    generateId() {
        return `seller_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    updateRating(newRating) {
        const totalRating = (this.rating * this.totalReviews) + newRating;
        this.totalReviews += 1;
        this.rating = totalRating / this.totalReviews;
        this.updatedAt = new Date().toISOString();
    }

    incrementSales(amount) {
        this.totalSales += 1;
        this.stats.soldItems += 1;
        this.stats.totalRevenue += amount;
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            businessName: this.businessName,
            description: this.description,
            logo: this.logo,
            rating: parseFloat(this.rating.toFixed(1)),
            totalSales: this.totalSales,
            totalReviews: this.totalReviews,
            commission: this.commission,
            status: this.status,
            settings: this.settings,
            address: this.address,
            stats: this.stats,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

export default Seller;
