import express from 'express';
import { optimizeCart, getSuggestions } from '../services/cartOptimizerService.js';

const router = express.Router();

/**
 * POST /api/cart/optimize
 * Optimize cart to minimize shipping by consolidating sellers
 */
router.post('/optimize', async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: 'Carrinho vazio',
                message: 'Adicione itens ao carrinho para otimizar'
            });
        }

        const result = await optimizeCart(items);

        res.json({
            success: result.success,
            ...result
        });
    } catch (error) {
        console.error('Cart optimize error:', error);
        res.status(500).json({
            error: 'Erro ao otimizar carrinho',
            message: error.message
        });
    }
});

/**
 * POST /api/cart/suggestions
 * Get optimization suggestions without modifying cart
 */
router.post('/suggestions', async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.json({
                hasSuggestions: false,
                suggestions: []
            });
        }

        const result = await getSuggestions(items);

        res.json(result);
    } catch (error) {
        console.error('Cart suggestions error:', error);
        res.status(500).json({
            error: 'Erro ao buscar sugestões',
            message: error.message
        });
    }
});

export default router;
