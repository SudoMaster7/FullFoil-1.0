/**
 * Order Service - FullFoil
 * 
 * Handles orders via Django catalog API.
 * Note: Stripe integration will be added separately.
 */

import { API_URLS } from '../config/api.js';
import authService from './authService.js';

const ORDERS_API = `${API_URLS.CATALOG}/orders`;

/**
 * Create a new order
 */
export async function createOrder(orderData) {
    const token = authService.getToken();

    const response = await fetch(`${ORDERS_API}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to create order');
    }

    return data;
}

/**
 * Get order by ID
 */
export async function getOrder(orderId) {
    const token = authService.getToken();

    const response = await fetch(`${ORDERS_API}/${orderId}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Failed to get order');
    }

    return data;
}

/**
 * Get all orders for current user
 */
export async function getAllOrders() {
    const token = authService.getToken();

    const response = await fetch(`${ORDERS_API}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Failed to get orders');
    }

    // Handle DRF pagination
    return data.results || data;
}

/**
 * Update order status (admin/seller only)
 */
export async function updateOrderStatus(orderId, status) {
    const token = authService.getToken();

    const response = await fetch(`${ORDERS_API}/${orderId}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Failed to update order status');
    }

    return data;
}

/**
 * Create a payment intent (Stripe)
 * Note: Stripe integration needs to be configured in Django
 */
export async function createPaymentIntent(amount, currency = 'brl') {
    // This would connect to a Stripe endpoint in Django
    // For now, return mock data for development
    console.warn('Stripe payment intent - Django integration pending');

    return {
        clientSecret: 'mock_client_secret',
        paymentIntentId: 'mock_pi_' + Date.now()
    };
}

/**
 * Get payment intent status
 */
export async function getPaymentStatus(paymentIntentId) {
    // Stripe integration pending
    console.warn('Stripe payment status - Django integration pending');

    return {
        status: 'succeeded'
    };
}

export default {
    createPaymentIntent,
    getPaymentStatus,
    createOrder,
    getOrder,
    getAllOrders,
    updateOrderStatus
};
