import { getAllListings } from './listingService.js';
import { getSellerById } from './sellerService.js';

/**
 * Cart Optimizer Service
 * 
 * Minimizes shipping costs by consolidating sellers.
 * Uses a greedy algorithm to find the minimum set of sellers
 * that can fulfill all items in the cart.
 */

/**
 * Find optimal seller combination for cart items
 * @param {Array} cartItems - Array of { cardProductId, quantity, preferredCondition }
 * @returns {Object} - Optimization result
 */
export async function optimizeCart(cartItems) {
    if (!cartItems || cartItems.length === 0) {
        return {
            success: false,
            message: 'Cart is empty',
            optimizedCart: [],
            totalSellers: 0,
            estimatedShipping: 0
        };
    }

    const allListings = await getAllListings({ status: 'active' });

    // Build availability map: cardProductId -> [listings]
    const availabilityMap = new Map();

    for (const item of cartItems) {
        const cardId = item.cardProductId || item.cardId;
        const available = allListings.filter(l =>
            (l.cardProductId === cardId || l.cardId === cardId) &&
            l.quantity >= (item.quantity || 1) &&
            l.status === 'active'
        );

        // Sort by price (lowest first)
        available.sort((a, b) => a.price - b.price);

        availabilityMap.set(cardId, available);
    }

    // Check if all items are available
    const unavailableItems = [];
    for (const [cardId, listings] of availabilityMap) {
        if (listings.length === 0) {
            unavailableItems.push(cardId);
        }
    }

    if (unavailableItems.length > 0) {
        return {
            success: false,
            message: `Some items are not available: ${unavailableItems.length} cards`,
            unavailableItems,
            optimizedCart: [],
            totalSellers: 0,
            estimatedShipping: 0
        };
    }

    // Build seller coverage map: sellerId -> [cardIds they can fulfill]
    const sellerCoverage = new Map();

    for (const [cardId, listings] of availabilityMap) {
        for (const listing of listings) {
            if (!sellerCoverage.has(listing.sellerId)) {
                sellerCoverage.set(listing.sellerId, {
                    sellerId: listing.sellerId,
                    cards: new Map(),
                    totalPrice: 0
                });
            }

            const sellerData = sellerCoverage.get(listing.sellerId);
            // Only add if this seller doesn't already have this card, or has a better price
            if (!sellerData.cards.has(cardId) || sellerData.cards.get(cardId).price > listing.price) {
                sellerData.cards.set(cardId, listing);
            }
        }
    }

    // Greedy algorithm: pick seller with most coverage, lowest total price
    const selectedSellers = [];
    const coveredCards = new Set();
    const optimizedCart = [];

    while (coveredCards.size < cartItems.length) {
        let bestSeller = null;
        let bestScore = -1;

        for (const [sellerId, sellerData] of sellerCoverage) {
            // Count uncovered cards this seller can provide
            const uncoveredCards = [...sellerData.cards.keys()].filter(c => !coveredCards.has(c));

            if (uncoveredCards.length === 0) continue;

            // Score: more cards = better, tie-breaker is lower total price
            const totalPrice = uncoveredCards.reduce((sum, cardId) =>
                sum + sellerData.cards.get(cardId).price, 0
            );

            const score = uncoveredCards.length * 1000 - totalPrice; // Weight coverage heavily

            if (score > bestScore) {
                bestScore = score;
                bestSeller = { sellerId, uncoveredCards, sellerData };
            }
        }

        if (!bestSeller) break;

        // Add this seller's cards to the optimized cart
        selectedSellers.push(bestSeller.sellerId);

        for (const cardId of bestSeller.uncoveredCards) {
            const listing = bestSeller.sellerData.cards.get(cardId);
            optimizedCart.push({
                cardId,
                cardProductId: listing.cardProductId || cardId,
                listingId: listing.id,
                sellerId: bestSeller.sellerId,
                price: listing.price,
                condition: listing.condition,
                quantity: cartItems.find(i => (i.cardProductId || i.cardId) === cardId)?.quantity || 1
            });
            coveredCards.add(cardId);
        }

        // Remove this seller from consideration
        sellerCoverage.delete(bestSeller.sellerId);
    }

    // Calculate totals
    const subtotal = optimizedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingPerSeller = 15.00; // R$15 per seller
    const estimatedShipping = selectedSellers.length * shippingPerSeller;
    const total = subtotal + estimatedShipping;

    // Get seller details
    const sellerDetails = await Promise.all(
        selectedSellers.map(async sellerId => {
            const seller = await getSellerById(sellerId);
            return seller ? {
                id: sellerId,
                name: seller.businessName,
                rating: seller.rating,
                itemCount: optimizedCart.filter(i => i.sellerId === sellerId).length
            } : null;
        })
    );

    return {
        success: true,
        message: `Optimized to ${selectedSellers.length} seller(s)`,
        optimizedCart,
        sellers: sellerDetails.filter(Boolean),
        totalSellers: selectedSellers.length,
        subtotal: parseFloat(subtotal.toFixed(2)),
        estimatedShipping: parseFloat(estimatedShipping.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        savings: cartItems.length > selectedSellers.length
            ? `Consolidou ${cartItems.length} itens em ${selectedSellers.length} vendedor(es)`
            : null
    };
}

/**
 * Check if items can be consolidated to fewer sellers
 * Returns suggestions without modifying the cart
 */
export async function getSuggestions(cartItems) {
    if (!cartItems || cartItems.length < 2) {
        return { hasSuggestions: false, suggestions: [] };
    }

    const result = await optimizeCart(cartItems);

    if (!result.success) {
        return { hasSuggestions: false, suggestions: [] };
    }

    // Compare current sellers vs optimized
    const currentSellers = new Set(cartItems.map(i => i.sellerId).filter(Boolean));

    if (result.totalSellers < currentSellers.size) {
        return {
            hasSuggestions: true,
            suggestions: [{
                type: 'consolidate',
                message: `Você pode economizar frete consolidando para ${result.totalSellers} vendedor(es)`,
                currentSellers: currentSellers.size,
                optimizedSellers: result.totalSellers,
                potentialSavings: (currentSellers.size - result.totalSellers) * 15.00
            }]
        };
    }

    return { hasSuggestions: false, suggestions: [] };
}

export default {
    optimizeCart,
    getSuggestions
};
