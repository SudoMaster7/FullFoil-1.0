import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Seller from '../models/Seller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const SELLERS_FILE = path.join(DATA_DIR, 'sellers.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Load sellers from file
async function loadSellers() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(SELLERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save sellers to file
async function saveSellers(sellers) {
    await ensureDataDir();
    await fs.writeFile(SELLERS_FILE, JSON.stringify(sellers, null, 2), 'utf-8');
}

/**
 * Create a new seller
 */
export async function createSeller(sellerData) {
    try {
        const sellers = await loadSellers();

        // Check if user already has a seller account
        if (sellers.find(s => s.userId === sellerData.userId)) {
            throw new Error('Usuário já possui uma conta de vendedor');
        }

        // Check if business name is taken
        if (sellers.find(s => s.businessName.toLowerCase() === sellerData.businessName.toLowerCase())) {
            throw new Error('Nome comercial já está em uso');
        }

        const seller = new Seller(sellerData);
        sellers.push(seller);
        await saveSellers(sellers);

        console.log(`✅ Seller created: ${seller.businessName}`);
        return seller;
    } catch (error) {
        console.error('Error creating seller:', error);
        throw error;
    }
}

/**
 * Get seller by ID
 */
export async function getSellerById(sellerId) {
    try {
        const sellers = await loadSellers();
        return sellers.find(s => s.id === sellerId) || null;
    } catch (error) {
        console.error('Error getting seller:', error);
        throw error;
    }
}

/**
 * Get seller by user ID
 */
export async function getSellerByUserId(userId) {
    try {
        const sellers = await loadSellers();
        return sellers.find(s => s.userId === userId) || null;
    } catch (error) {
        console.error('Error getting seller by user:', error);
        throw error;
    }
}

/**
 * Get all sellers
 */
export async function getAllSellers(filters = {}) {
    try {
        let sellers = await loadSellers();

        // Filter by status
        if (filters.status) {
            sellers = sellers.filter(s => s.status === filters.status);
        }

        // Sort by rating (default)
        sellers.sort((a, b) => b.rating - a.rating);

        return sellers;
    } catch (error) {
        console.error('Error getting sellers:', error);
        throw error;
    }
}

/**
 * Update seller
 */
export async function updateSeller(sellerId, updates) {
    try {
        const sellers = await loadSellers();
        const sellerIndex = sellers.findIndex(s => s.id === sellerId);

        if (sellerIndex === -1) {
            throw new Error('Vendedor não encontrado');
        }

        // Update allowed fields
        const allowedFields = ['businessName', 'description', 'logo', 'settings', 'address'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                if (field === 'settings' || field === 'address') {
                    sellers[sellerIndex][field] = { ...sellers[sellerIndex][field], ...updates[field] };
                } else {
                    sellers[sellerIndex][field] = updates[field];
                }
            }
        });

        sellers[sellerIndex].updatedAt = new Date().toISOString();

        await saveSellers(sellers);
        return sellers[sellerIndex];
    } catch (error) {
        console.error('Error updating seller:', error);
        throw error;
    }
}

/**
 * Update seller status
 */
export async function updateSellerStatus(sellerId, status) {
    try {
        const sellers = await loadSellers();
        const sellerIndex = sellers.findIndex(s => s.id === sellerId);

        if (sellerIndex === -1) {
            throw new Error('Vendedor não encontrado');
        }

        const validStatuses = ['pending', 'active', 'suspended'];
        if (!validStatuses.includes(status)) {
            throw new Error('Status inválido');
        }

        sellers[sellerIndex].status = status;
        sellers[sellerIndex].updatedAt = new Date().toISOString();

        await saveSellers(sellers);
        return sellers[sellerIndex];
    } catch (error) {
        console.error('Error updating seller status:', error);
        throw error;
    }
}

/**
 * Get seller statistics
 */
export async function getSellerStats(sellerId) {
    try {
        const seller = await getSellerById(sellerId);
        if (!seller) {
            throw new Error('Vendedor não encontrado');
        }

        return {
            sellerId: seller.id,
            businessName: seller.businessName,
            rating: seller.rating,
            totalSales: seller.totalSales,
            totalReviews: seller.totalReviews,
            stats: seller.stats,
            memberSince: seller.createdAt
        };
    } catch (error) {
        console.error('Error getting seller stats:', error);
        throw error;
    }
}

export default {
    createSeller,
    getSellerById,
    getSellerByUserId,
    getAllSellers,
    updateSeller,
    updateSellerStatus,
    getSellerStats
};
