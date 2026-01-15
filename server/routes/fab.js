import express from 'express';
import axios from 'axios';
import { getCache, setCache, generateCacheKey } from '../utils/cache.js';

const router = express.Router();
// Using GitHub JSON data as FAB doesn't have a public API
const FAB_DATA_URL = 'https://raw.githubusercontent.com/the-fab-cube/flesh-and-blood-cards/develop/json/english/card.json';

// GET /api/fab/cards - Search cards
router.get('/cards', async (req, res) => {
    try {
        const cacheKey = generateCacheKey('fab:cards', req.query);
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const response = await axios.get(FAB_DATA_URL, {
            timeout: 10000
        });

        let cards = response.data;

        // Apply filters from query
        if (req.query.class) {
            cards = cards.filter(c => c.class === req.query.class);
        }
        if (req.query.type) {
            cards = cards.filter(c => c.type === req.query.type);
        }

        const data = { data: cards };
        setCache(cacheKey, data);
        res.json(data);
    } catch (error) {
        console.error('FAB data error:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch Flesh and Blood cards',
            message: error.message
        });
    }
});

// GET /api/fab/cards/random - Get random cards
router.get('/cards/random', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 12;

        const response = await axios.get(FAB_DATA_URL);
        const allCards = response.data;

        // Shuffle and pick random cards
        const shuffled = allCards.sort(() => 0.5 - Math.random());
        const randomCards = shuffled.slice(0, count);

        res.json({ data: randomCards });
    } catch (error) {
        console.error('FAB random data error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch random Flesh and Blood cards',
            message: error.message
        });
    }
});

export default router;
