import express from 'express';
import {
    createSeller,
    getSellerById,
    getSellerByUserId,
    getAllSellers,
    updateSeller,
    updateSellerStatus,
    getSellerStats
} from '../services/sellerService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/sellers
 * Create a new seller account (requires authentication)
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { businessName, description, logo, address, settings } = req.body;

        if (!businessName || businessName.trim().length < 3) {
            return res.status(400).json({
                error: 'Dados inválidos',
                message: 'Nome comercial deve ter no mínimo 3 caracteres'
            });
        }

        const sellerData = {
            userId: req.userId,
            businessName: businessName.trim(),
            description: description || '',
            logo: logo || null,
            address: address || {},
            settings: settings || {}
        };

        const seller = await createSeller(sellerData);

        res.status(201).json({
            success: true,
            seller: seller.toJSON()
        });
    } catch (error) {
        console.error('Seller creation error:', error);

        if (error.message.includes('já possui') || error.message.includes('em uso')) {
            return res.status(409).json({
                error: 'Conflito',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Erro ao criar vendedor',
            message: error.message
        });
    }
});

/**
 * GET /api/sellers
 * Get all sellers (public)
 */
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const filters = {};

        if (status) {
            filters.status = status;
        } else {
            // By default, only show active sellers to public
            filters.status = 'active';
        }

        const sellers = await getAllSellers(filters);

        res.json({
            success: true,
            count: sellers.length,
            sellers
        });
    } catch (error) {
        console.error('Get sellers error:', error);
        res.status(500).json({
            error: 'Erro ao buscar vendedores',
            message: error.message
        });
    }
});

/**
 * GET /api/sellers/me
 * Get current user's seller account (requires authentication)
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const seller = await getSellerByUserId(req.userId);

        if (!seller) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Você ainda não possui uma conta de vendedor'
            });
        }

        res.json({
            success: true,
            seller
        });
    } catch (error) {
        console.error('Get my seller error:', error);
        res.status(500).json({
            error: 'Erro ao buscar vendedor',
            message: error.message
        });
    }
});

/**
 * GET /api/sellers/:id
 * Get seller by ID (public)
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const seller = await getSellerById(id);

        if (!seller) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Vendedor não encontrado'
            });
        }

        res.json({
            success: true,
            seller
        });
    } catch (error) {
        console.error('Get seller error:', error);
        res.status(500).json({
            error: 'Erro ao buscar vendedor',
            message: error.message
        });
    }
});

/**
 * PUT /api/sellers/:id
 * Update seller (requires authentication and ownership)
 */
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const seller = await getSellerById(id);

        if (!seller) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Vendedor não encontrado'
            });
        }

        // Check ownership
        if (seller.userId !== req.userId) {
            return res.status(403).json({
                error: 'Acesso negado',
                message: 'Você não tem permissão para editar este vendedor'
            });
        }

        const updates = req.body;
        const updatedSeller = await updateSeller(id, updates);

        res.json({
            success: true,
            seller: updatedSeller
        });
    } catch (error) {
        console.error('Update seller error:', error);
        res.status(500).json({
            error: 'Erro ao atualizar vendedor',
            message: error.message
        });
    }
});

/**
 * GET /api/sellers/:id/stats
 * Get seller statistics (public)
 */
router.get('/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;
        const stats = await getSellerStats(id);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Get seller stats error:', error);

        if (error.message === 'Vendedor não encontrado') {
            return res.status(404).json({
                error: 'Não encontrado',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Erro ao buscar estatísticas',
            message: error.message
        });
    }
});

/**
 * PUT /api/sellers/:id/status
 * Update seller status (admin only - for now requires auth)
 */
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error: 'Dados inválidos',
                message: 'Status é obrigatório'
            });
        }

        const updatedSeller = await updateSellerStatus(id, status);

        res.json({
            success: true,
            seller: updatedSeller
        });
    } catch (error) {
        console.error('Update seller status error:', error);

        if (error.message === 'Vendedor não encontrado') {
            return res.status(404).json({
                error: 'Não encontrado',
                message: error.message
            });
        }

        if (error.message === 'Status inválido') {
            return res.status(400).json({
                error: 'Dados inválidos',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Erro ao atualizar status',
            message: error.message
        });
    }
});

export default router;
