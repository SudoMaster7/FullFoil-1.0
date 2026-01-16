import express from 'express';
import {
    createListing,
    getListingById,
    getAllListings,
    searchListingsByCard,
    updateListing,
    deleteListing
} from '../services/listingService.js';
import { getSellerById } from '../services/sellerService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/listings
 * Create a new listing (requires authentication and seller account)
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { cardId, cardData, quantity, condition, language, foil, price } = req.body;

        // Validate required fields
        if (!cardId || !cardData || !cardData.name || !cardData.game) {
            return res.status(400).json({
                error: 'Dados inválidos',
                message: 'cardId, cardData (nome e jogo) são obrigatórios'
            });
        }

        if (!price || price <= 0) {
            return res.status(400).json({
                error: 'Preço inválido',
                message: 'Preço deve ser maior que zero'
            });
        }

        // Check if user has a seller account
        const seller = await getSellerById(req.userId);
        if (!seller) {
            return res.status(403).json({
                error: 'Acesso negado',
                message: 'Você precisa ser um vendedor para criar listings'
            });
        }

        if (seller.status !== 'active') {
            return res.status(403).json({
                error: 'Conta suspensa',
                message: 'Sua conta de vendedor não está ativa'
            });
        }

        const listingData = {
            sellerId: seller.id,
            cardId,
            cardData,
            quantity: quantity || 1,
            condition: condition || 'near_mint',
            language: language || 'en',
            foil: foil || false,
            price: parseFloat(price)
        };

        const listing = await createListing(listingData);

        res.status(201).json({
            success: true,
            listing
        });
    } catch (error) {
        console.error('Listing creation error:', error);
        res.status(500).json({
            error: 'Erro ao criar listing',
            message: error.message
        });
    }
});

/**
 * GET /api/listings
 * Get all listings with filters (public)
 */
router.get('/', async (req, res) => {
    try {
        const filters = req.query;
        const listings = await getAllListings(filters);

        res.json({
            success: true,
            count: listings.length,
            listings
        });
    } catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({
            error: 'Erro ao buscar listings',
            message: error.message
        });
    }
});

/**
 * GET /api/listings/search/card/:cardId
 * Search listings by card ID (public)
 */
router.get('/search/card/:cardId', async (req, res) => {
    try {
        const { cardId } = req.params;
        const filters = req.query;
        const listings = await searchListingsByCard(cardId, filters);

        res.json({
            success: true,
            count: listings.length,
            listings
        });
    } catch (error) {
        console.error('Search listings error:', error);
        res.status(500).json({
            error: 'Erro ao buscar listings',
            message: error.message
        });
    }
});

/**
 * GET /api/listings/:id
 * Get listing by ID (public)
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await getListingById(id);

        if (!listing) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Listing não encontrado'
            });
        }

        res.json({
            success: true,
            listing
        });
    } catch (error) {
        console.error('Get listing error:', error);
        res.status(500).json({
            error: 'Erro ao buscar listing',
            message: error.message
        });
    }
});

/**
 * PUT /api/listings/:id
 * Update listing (requires authentication and ownership)
 */
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await getListingById(id);

        if (!listing) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Listing não encontrado'
            });
        }

        // Check if seller exists and belongs to user
        const seller = await getSellerById(listing.sellerId);
        if (!seller || seller.userId !== req.userId) {
            return res.status(403).json({
                error: 'Acesso negado',
                message: 'Você não tem permissão para editar este listing'
            });
        }

        const updates = req.body;
        const updatedListing = await updateListing(id, updates);

        res.json({
            success: true,
            listing: updatedListing
        });
    } catch (error) {
        console.error('Update listing error:', error);
        res.status(500).json({
            error: 'Erro ao atualizar listing',
            message: error.message
        });
    }
});

/**
 * DELETE /api/listings/:id
 * Delete listing (requires authentication and ownership)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await getListingById(id);

        if (!listing) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Listing não encontrado'
            });
        }

        // Check ownership
        const seller = await getSellerById(listing.sellerId);
        if (!seller || seller.userId !== req.userId) {
            return res.status(403).json({
                error: 'Acesso negado',
                message: 'Você não tem permissão para deletar este listing'
            });
        }

        await deleteListing(id);

        res.json({
            success: true,
            message: 'Listing deletado com sucesso'
        });
    } catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({
            error: 'Erro ao deletar listing',
            message: error.message
        });
    }
});

export default router;
