import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Order from '../models/Order.js';
import { recordSale } from './priceService.js';
import { getListingById } from './listingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Load orders from file
async function loadOrders() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(ORDERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // File doesn't exist or is empty, return empty array
        return [];
    }
}

// Save orders to file
async function saveOrders(orders) {
    await ensureDataDir();
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

/**
 * Create a new order
 * @param {object} orderData - Order data including items, shipping, payment, totals
 * @returns {Promise<object>} Created order
 */
export async function createOrder(orderData) {
    try {
        const order = new Order(orderData);
        const orders = await loadOrders();
        orders.push(order.toJSON());
        await saveOrders(orders);

        console.log(`✅ Order created: ${order.orderNumber}`);

        // Record sales for Market Price Intelligence
        try {
            for (const item of orderData.items) {
                // Get listing details
                const listing = item.listingId ? await getListingById(item.listingId) : null;

                if (listing) {
                    await recordSale({
                        cardProductId: listing.cardProductId || `card_${item.game}_${item.cardId}`,
                        listingId: listing.id,
                        sellerId: listing.sellerId,
                        buyerId: orderData.userId,
                        orderId: order.id,
                        price: item.price,
                        quantity: item.quantity || 1,
                        condition: listing.condition,
                        language: listing.language,
                        foil: listing.foil
                    });
                }
            }
        } catch (saleError) {
            console.error('Error recording sales:', saleError);
            // Don't fail order creation if sale recording fails
        }

        return order.toJSON();
    } catch (error) {
        console.error('Error creating order:', error);
        throw new Error(`Failed to create order: ${error.message}`);
    }
}

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<object|null>} Order or null if not found
 */
export async function getOrderById(orderId) {
    try {
        const orders = await loadOrders();
        const order = orders.find(o => o.id === orderId);
        return order || null;
    } catch (error) {
        console.error('Error getting order:', error);
        throw new Error(`Failed to get order: ${error.message}`);
    }
}

/**
 * Get all orders
 * @returns {Promise<array>} Array of orders
 */
export async function getAllOrders() {
    try {
        const orders = await loadOrders();
        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error('Error getting orders:', error);
        throw new Error(`Failed to get orders: ${error.message}`);
    }
}

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<object|null>} Updated order or null if not found
 */
export async function updateOrderStatus(orderId, status) {
    try {
        const orders = await loadOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            return null;
        }

        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        await saveOrders(orders);

        console.log(`✅ Order ${orders[orderIndex].orderNumber} updated to ${status}`);
        return orders[orderIndex];
    } catch (error) {
        console.error('Error updating order:', error);
        throw new Error(`Failed to update order: ${error.message}`);
    }
}

/**
 * Update order payment status
 * @param {string} orderId - Order ID
 * @param {object} paymentData - Payment data to update
 * @returns {Promise<object|null>} Updated order or null if not found
 */
export async function updateOrderPayment(orderId, paymentData) {
    try {
        const orders = await loadOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            return null;
        }

        orders[orderIndex].payment = { ...orders[orderIndex].payment, ...paymentData };
        orders[orderIndex].updatedAt = new Date().toISOString();
        await saveOrders(orders);

        return orders[orderIndex];
    } catch (error) {
        console.error('Error updating order payment:', error);
        throw new Error(`Failed to update order payment: ${error.message}`);
    }
}

export default {
    createOrder,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    updateOrderPayment
};
