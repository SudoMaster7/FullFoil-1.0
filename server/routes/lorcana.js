import express from 'express';
import axios from 'axios';
import { getCache, setCache, generateCacheKey } from '../utils/cache.js';

const router = express.Router();
const LORCANA_API = 'https://api.lorcana-api.com';

// GET /api/lorcana/cards - Search cards
router.get('/cards', async (req, res) => {
    try {
        const cacheKey = generateCacheKey('lorcana:cards', req.query);
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const response = await axios.get(`${LORCANA_API}/cards/all`, {
            params: req.query,
            timeout: 10000
        });

        const data = response.data;
        setCache(cacheKey, data);
        res.json(data);
    } catch (error) {
        console.error('Lorcana API error:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch Lorcana cards',
            message: error.message
        });
    }
});

// GET /api/lorcana/cards/random - Get random cards
router.get('/cards/random', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 12;

        // Get all cards and randomly select
        const response = await axios.get(`${LORCANA_API}/cards/all`);
        const allCards = response.data;

        // Shuffle and pick random cards
        const shuffled = allCards.sort(() => 0.5 - Math.random());
        const randomCards = shuffled.slice(0, count);

        res.json(randomCards);
    } catch (error) {
        console.error('Lorcana random API error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch random Lorcana cards',
            message: error.message
        });
    }
});

export default router;
