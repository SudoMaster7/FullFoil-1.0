import express from 'express';
import axios from 'axios';
import { getCache, setCache, generateCacheKey } from '../utils/cache.js';

const router = express.Router();
const SCRYFALL_API = 'https://api.scryfall.com';

// GET /api/magic/cards - Search cards
router.get('/cards', async (req, res) => {
    try {
        const cacheKey = generateCacheKey('magic:cards', req.query);
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const response = await axios.get(`${SCRYFALL_API}/cards/search`, {
            params: req.query,
            timeout: 10000
        });

        const data = response.data;
        setCache(cacheKey, data);
        res.json(data);
    } catch (error) {
        console.error('Magic API error:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch Magic cards',
            message: error.message
        });
    }
});

// GET /api/magic/cards/random - Get random cards
router.get('/cards/random', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 12;
        const response = await axios.get(`${SCRYFALL_API}/cards/random`);

        // Scryfall doesn't have bulk random, so we call multiple times
        const promises = Array(count).fill().map(() =>
            axios.get(`${SCRYFALL_API}/cards/random`)
        );

        const results = await Promise.all(promises);
        const cards = results.map(r => r.data);

        res.json({ data: cards });
    } catch (error) {
        console.error('Magic random API error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch random Magic cards',
            message: error.message
        });
    }
});

export default router;
