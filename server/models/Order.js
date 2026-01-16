// Order Model - Simple in-memory storage for MVP
// In future: replace with MongoDB/PostgreSQL

class Order {
    constructor({
        userId,
        items,
        shipping,
        payment,
        totals
    }) {
        this.id = this.generateId();
        this.orderNumber = this.generateOrderNumber();
        this.userId = userId || 'guest'; // Use provided userId or default to guest
        this.items = items;
        this.shipping = shipping;
        this.payment = payment;
        this.totals = totals;
        this.status = 'pending';
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    generateId() {
        return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORD-${year}${month}${day}-${random}`;
    }

    toJSON() {
        return {
            id: this.id,
            orderNumber: this.orderNumber,
            userId: this.userId,
            items: this.items,
            shipping: this.shipping,
            payment: this.payment,
            totals: this.totals,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

export default Order;
