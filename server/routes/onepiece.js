import express from 'express';
import axios from 'axios';
import { getCache, setCache, generateCacheKey } from '../utils/cache.js';

const router = express.Router();
const ONEPIECE_API = 'https://optcgapi.com/api';

// GET /api/onepiece/cards - Search cards
router.get('/cards', async (req, res) => {
    try {
        const cacheKey = generateCacheKey('onepiece:cards', req.query);
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Use the main endpoint that returns all cards
        const response = await axios.get(`${ONEPIECE_API}/allSetCards/`, {
            timeout: 20000
        });

        // Response is an array of cards
        let cards = response.data || [];

        // Apply filters if provided
        if (req.query.color) {
            const colors = req.query.color.split(',');
            cards = cards.filter(card => colors.includes(card.card_color));
        }
        if (req.query.type) {
            const types = req.query.type.split(',');
            cards = cards.filter(card => types.includes(card.card_type));
        }
        if (req.query.rarity) {
            const rarities = req.query.rarity.split(',');
            cards = cards.filter(card => rarities.includes(card.rarity));
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCards = cards.slice(startIndex, endIndex);

        const data = {
            cards: paginatedCards,
            pagination: {
                page,
                pageSize,
                total: cards.length,
                hasMore: endIndex < cards.length
            }
        };

        setCache(cacheKey, data);
        res.json(data);
    } catch (error) {
        console.error('One Piece API error:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch One Piece cards',
            message: error.message
        });
    }
});

// GET /api/onepiece/cards/random - Get random cards
router.get('/cards/random', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 12;

        const response = await axios.get(`${ONEPIECE_API}/allSetCards/`, {
            timeout: 20000
        });

        const allCards = response.data || [];

        // Shuffle and pick random cards
        const shuffled = allCards.sort(() => 0.5 - Math.random());
        const randomCards = shuffled.slice(0, count);

        res.json({
            cards: randomCards,
            pagination: {
                total: count,
                hasMore: false
            }
        });
    } catch (error) {
        console.error('One Piece random API error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch random One Piece cards',
            message: error.message
        });
    }
});

export default router;
