import express from 'express';
import axios from 'axios';
import { getCache, setCache, generateCacheKey } from '../utils/cache.js';

const router = express.Router();
const YUGIOH_API = 'https://db.ygoprodeck.com/api/v7';

// GET /api/yugioh/cards - Search cards
router.get('/cards', async (req, res) => {
    try {
        const cacheKey = generateCacheKey('yugioh:cards', req.query);
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const response = await axios.get(`${YUGIOH_API}/cardinfo.php`, {
            params: { ...req.query, num: 500, offset: 0 }, // Increased from 100 to 500
            timeout: 20000 // Increased timeout for larger dataset
        });

        const data = response.data;
        setCache(cacheKey, data);
        res.json(data);
    } catch (error) {
        console.error('Yu-Gi-Oh API error:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch Yu-Gi-Oh cards',
            message: error.message
        });
    }
});

// GET /api/yugioh/cards/random - Get random cards
router.get('/cards/random', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 12;
        const offset = Math.floor(Math.random() * 1000);

        const response = await axios.get(`${YUGIOH_API}/cardinfo.php`, {
            params: {
                num: count,
                offset
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Yu-Gi-Oh random API error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch random Yu-Gi-Oh cards',
            message: error.message
        });
    }
});

export default router;
