import express from 'express';
import { createPaymentIntent, getPaymentIntent } from '../services/stripeService.js';

const router = express.Router();

/**
 * POST /api/payment/create-intent
 * Create a new payment intent
 */
router.post('/create-intent', async (req, res) => {
    try {
        const { amount, currency = 'brl' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: 'Invalid amount',
                message: 'Amount must be greater than 0'
            });
        }

        const paymentIntent = await createPaymentIntent(amount, currency);

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Payment intent creation error:', error);
        res.status(500).json({
            error: 'Payment intent creation failed',
            message: error.message
        });
    }
});

/**
 * GET /api/payment/status/:paymentIntentId
 * Get payment intent status
 */
router.get('/status/:paymentIntentId', async (req, res) => {
    try {
        const { paymentIntentId } = req.params;

        const paymentIntent = await getPaymentIntent(paymentIntentId);

        res.json({
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100, // Convert back from centavos
            currency: paymentIntent.currency,
            paymentMethod: paymentIntent.payment_method,
            created: paymentIntent.created
        });
    } catch (error) {
        console.error('Payment status check error:', error);
        res.status(500).json({
            error: 'Failed to check payment status',
            message: error.message
        });
    }
});

/**
 * POST /api/payment/webhook
 * Stripe webhook endpoint (for future implementation)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    // TODO: Implement webhook verification and handling
    console.log('Webhook received:', req.body);
    res.json({ received: true });
});

export default router;
