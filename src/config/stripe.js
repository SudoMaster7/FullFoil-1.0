import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with publishable key
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default stripePromise;
