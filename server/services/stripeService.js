import Stripe from 'stripe';

// Lazy initialization - only create Stripe instance when needed
let stripeInstance = null;

function getStripe() {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripeInstance;
}

/**
 * Create a payment intent for Stripe
 * @param {number} amount - Amount in BRL (will be converted to centavos)
 * @param {string} currency - Currency code (default: brl)
 * @returns {Promise<object>} Stripe PaymentIntent object
 */
export async function createPaymentIntent(amount, currency = 'brl') {
    try {
        const paymentIntent = await getStripe().paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to centavos
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                integration_source: 'fullfoil-tcg'
            }
        });

        return paymentIntent;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error(`Failed to create payment intent: ${error.message}`);
    }
}

/**
 * Retrieve a payment intent by ID
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<object>} Stripe PaymentIntent object
 */
export async function getPaymentIntent(paymentIntentId) {
    try {
        const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        console.error('Error retrieving payment intent:', error);
        throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
}

/**
 * Confirm a payment intent
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<object>} Confirmed PaymentIntent object
 */
export async function confirmPaymentIntent(paymentIntentId) {
    try {
        const paymentIntent = await getStripe().paymentIntents.confirm(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        console.error('Error confirming payment intent:', error);
        throw new Error(`Failed to confirm payment intent: ${error.message}`);
    }
}

export default {
    createPaymentIntent,
    getPaymentIntent,
    confirmPaymentIntent
};
