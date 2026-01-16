import express from 'express';
import pokemon from 'pokemontcgsdk';
import { getCache, setCache, generateCacheKey } from '../utils/cache.js';

const router = express.Router();

// Configure SDK with API key if available
if (process.env.POKEMON_TCG_API_KEY) {
    pokemon.configure({ apiKey: process.env.POKEMON_TCG_API_KEY });
}

/**
 * GET /api/pokemon/cards
 * Search Pokemon cards with filters
 */
router.get('/cards', async (req, res) => {
    try {
        const cacheKey = generateCacheKey('pokemon:cards', req.query);
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const { page = 1, pageSize = 50, q } = req.query;

        console.log(`Pokemon API: Fetching cards (page ${page}, size ${pageSize})`);

        // Build query if provided
        const queryParams = {
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        };

        if (q) {
            queryParams.q = q;
        }

        // Use SDK to fetch cards
        const result = await pokemon.card.all(queryParams);

        const response = {
            data: result.data || [],
            page: result.page || 1,
            pageSize: result.pageSize || pageSize,
            count: result.count || 0,
            totalCount: result.totalCount || 0
        };

        setCache(cacheKey, response, 300); // Cache for 5 minutes
        res.json(response);
    } catch (error) {
        console.error('Pokemon API error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch Pokemon cards',
            message: error.message
        });
    }
});

/**
 * GET /api/pokemon/cards/random
 * Get random Pokemon cards
 */
router.get('/cards/random', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 12;

        console.log(`Pokemon API: Fetching ${count} random cards`);

        // Fetch recent sets to get random cards from
        const randomPage = Math.floor(Math.random() * 10) + 1;
        const result = await pokemon.card.all({
            page: randomPage,
            pageSize: count,
            orderBy: '-set.releaseDate' // Get newer cards
        });

        const response = {
            data: result.data || [],
            count: result.data?.length || 0
        };

        res.json(response);
    } catch (error) {
        console.error('Pokemon random API error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch random Pokemon cards',
            message: error.message
        });
    }
});

/**
 * GET /api/pokemon/cards/:id
 * Get a specific Pokemon card by ID
 */
router.get('/cards/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Pokemon API: Fetching card ${id}`);

        const card = await pokemon.card.find(id);

        if (!card) {
            return res.status(404).json({
                error: 'Card not found',
                message: `No Pokemon card found with ID: ${id}`
            });
        }

        res.json({ data: card });
    } catch (error) {
        console.error('Pokemon API error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch Pokemon card',
            message: error.message
        });
    }
});

/**
 * GET /api/pokemon/sets
 * Get all Pokemon sets
 */
router.get('/sets', async (req, res) => {
    try {
        const cacheKey = 'pokemon:sets';
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        console.log('Pokemon API: Fetching sets');

        const result = await pokemon.set.all();

        const response = {
            data: result.data || [],
            count: result.data?.length || 0
        };

        setCache(cacheKey, response, 3600); // Cache for 1 hour
        res.json(response);
    } catch (error) {
        console.error('Pokemon sets API error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch Pokemon sets',
            message: error.message
        });
    }
});

export default router;
