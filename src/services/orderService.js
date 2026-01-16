import API_BASE from '../config/api.js';

const ORDERS_API = `${API_BASE}/orders`;
const PAYMENT_API = `${API_BASE}/payment`;

/**
 * Create a payment intent
 */
export async function createPaymentIntent(amount, currency = 'brl') {
    const response = await fetch(`${PAYMENT_API}/create-intent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, currency })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment intent');
    }

    return response.json();
}

/**
 * Get payment intent status
 */
export async function getPaymentStatus(paymentIntentId) {
    const response = await fetch(`${PAYMENT_API}/status/${paymentIntentId}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get payment status');
    }

    return response.json();
}

/**
 * Create a new order
 */
export async function createOrder(orderData) {
    const response = await fetch(ORDERS_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
    }

    return response.json();
}

/**
 * Get order by ID
 */
export async function getOrder(orderId) {
    const response = await fetch(`${ORDERS_API}/${orderId}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get order');
    }

    return response.json();
}

/**
 * Get all orders (optionally filtered by userId)
 */
export async function getAllOrders(userId = null) {
    const url = userId ? `${ORDERS_API}?userId=${userId}` : ORDERS_API;
    const response = await fetch(url);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get orders');
    }

    return response.json();
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status) {
    const response = await fetch(`${ORDERS_API}/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update order status');
    }

    return response.json();
}

export default {
    createPaymentIntent,
    getPaymentStatus,
    createOrder,
    getOrder,
    getAllOrders,
    updateOrderStatus
};
