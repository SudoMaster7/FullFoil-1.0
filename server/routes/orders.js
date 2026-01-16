import express from 'express';
import {
    createOrder,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    updateOrderPayment
} from '../services/orderService.js';

const router = express.Router();

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', async (req, res) => {
    try {
        const { userId, items, shipping, payment, totals } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: 'Invalid items',
                message: 'Items array is required and cannot be empty'
            });
        }

        if (!shipping || !shipping.fullName || !shipping.email) {
            return res.status(400).json({
                error: 'Invalid shipping',
                message: 'Shipping information with fullName and email is required'
            });
        }

        if (!payment || !payment.stripePaymentIntentId) {
            return res.status(400).json({
                error: 'Invalid payment',
                message: 'Payment information with stripePaymentIntentId is required'
            });
        }

        if (!totals || !totals.total) {
            return res.status(400).json({
                error: 'Invalid totals',
                message: 'Order totals are required'
            });
        }

        const order = await createOrder({ userId, items, shipping, payment, totals });

        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            error: 'Order creation failed',
            message: error.message
        });
    }
});

/**
 * GET /api/orders/:id
 * Get order by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await getOrderById(id);

        if (!order) {
            return res.status(404).json({
                error: 'Order not found',
                message: `No order found with ID: ${id}`
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Order retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve order',
            message: error.message
        });
    }
});

/**
 * GET /api/orders
 * Get all orders (optionally filtered by userId)
 */
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        let orders = await getAllOrders();

        // Filter by userId if provided
        if (userId) {
            orders = orders.filter(order => order.userId === userId);
        }

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('Orders retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve orders',
            message: error.message
        });
    }
});

/**
 * PUT /api/orders/:id/status
 * Update order status
 */
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                message: `Status must be one of: ${validStatuses.join(', ')}`
            });
        }

        const order = await updateOrderStatus(id, status);

        if (!order) {
            return res.status(404).json({
                error: 'Order not found',
                message: `No order found with ID: ${id}`
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Order status update error:', error);
        res.status(500).json({
            error: 'Failed to update order status',
            message: error.message
        });
    }
});

/**
 * PUT /api/orders/:id/payment
 * Update order payment information
 */
router.put('/:id/payment', async (req, res) => {
    try {
        const { id } = req.params;
        const paymentData = req.body;

        const order = await updateOrderPayment(id, paymentData);

        if (!order) {
            return res.status(404).json({
                error: 'Order not found',
                message: `No order found with ID: ${id}`
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Order payment update error:', error);
        res.status(500).json({
            error: 'Failed to update order payment',
            message: error.message
        });
    }
});

export default router;
