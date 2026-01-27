import express from 'express';
import {
    getCardProductById,
    searchCardProducts,
    getSetsByGame,
    getRaritiesByGame
} from '../services/cardProductService.js';
import { searchListingsByCard } from '../services/listingService.js';
import { getSalesHistory, getPriceStats } from '../services/priceService.js';

const router = express.Router();

/**
 * GET /api/cards
 * Search card catalog with filters
 */
router.get('/', async (req, res) => {
    try {
        const filters = req.query;
        const cards = await searchCardProducts(filters);

        res.json({
            success: true,
            count: cards.length,
            cards
        });
    } catch (error) {
        console.error('Search cards error:', error);
        res.status(500).json({
            error: 'Erro ao buscar cards',
            message: error.message
        });
    }
});

/**
 * GET /api/cards/:id
 * Get card by ID with market price
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const card = await getCardProductById(id);

        if (!card) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Card não encontrado no catálogo'
            });
        }

        res.json({
            success: true,
            card
        });
    } catch (error) {
        console.error('Get card error:', error);
        res.status(500).json({
            error: 'Erro ao buscar card',
            message: error.message
        });
    }
});

/**
 * GET /api/cards/:id/listings
 * Get all listings for a specific card (TCGPlayer-style)
 */
router.get('/:id/listings', async (req, res) => {
    try {
        const { id } = req.params;
        const filters = req.query;

        // Get card details
        const card = await getCardProductById(id);

        if (!card) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Card não encontrado no catálogo'
            });
        }

        // Get listings for this card
        const listings = await searchListingsByCard(id, filters);

        res.json({
            success: true,
            card,
            listingsCount: listings.length,
            listings
        });
    } catch (error) {
        console.error('Get card listings error:', error);
        res.status(500).json({
            error: 'Erro ao buscar listings',
            message: error.message
        });
    }
});

/**
 * GET /api/cards/:id/price-history
 * Get sales history for price charts
 */
router.get('/:id/price-history', async (req, res) => {
    try {
        const { id } = req.params;
        const days = parseInt(req.query.days) || 30;

        const history = await getSalesHistory(id, days);
        const stats = await getPriceStats(id);

        res.json({
            success: true,
            cardId: id,
            days,
            salesCount: history.length,
            history,
            stats
        });
    } catch (error) {
        console.error('Get price history error:', error);
        res.status(500).json({
            error: 'Erro ao buscar histórico de preços',
            message: error.message
        });
    }
});

/**
 * GET /api/cards/meta/sets/:game
 * Get all sets for a game (for filters)
 */
router.get('/meta/sets/:game', async (req, res) => {
    try {
        const { game } = req.params;
        const sets = await getSetsByGame(game);

        res.json({
            success: true,
            game,
            count: sets.length,
            sets
        });
    } catch (error) {
        console.error('Get sets error:', error);
        res.status(500).json({
            error: 'Erro ao buscar sets',
            message: error.message
        });
    }
});

/**
 * GET /api/cards/meta/rarities/:game
 * Get all rarities for a game (for filters)
 */
router.get('/meta/rarities/:game', async (req, res) => {
    try {
        const { game } = req.params;
        const rarities = await getRaritiesByGame(game);

        res.json({
            success: true,
            game,
            count: rarities.length,
            rarities
        });
    } catch (error) {
        console.error('Get rarities error:', error);
        res.status(500).json({
            error: 'Erro ao buscar raridades',
            message: error.message
        });
    }
});

export default router;
