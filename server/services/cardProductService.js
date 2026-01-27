import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import CardProduct from '../models/CardProduct.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const CATALOG_FILE = path.join(DATA_DIR, 'cardProducts.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Load card products from file
async function loadCardProducts() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(CATALOG_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save card products to file
async function saveCardProducts(products) {
    await ensureDataDir();
    await fs.writeFile(CATALOG_FILE, JSON.stringify(products, null, 2), 'utf-8');
}

/**
 * Get or create a CardProduct from external API data
 * This ensures we have a canonical entry for each card
 */
export async function getOrCreateCardProduct(externalData, game) {
    const products = await loadCardProducts();

    // Generate canonical ID
    const externalId = externalData.id?.toString() || externalData.externalId;
    const canonicalId = `card_${game}_${externalId}`;

    // Check if already exists
    let existing = products.find(p => p.id === canonicalId);

    if (existing) {
        return existing;
    }

    // Create new CardProduct based on game type
    let cardProduct;
    switch (game) {
        case 'magic':
            cardProduct = CardProduct.fromScryfall(externalData);
            break;
        case 'pokemon':
            cardProduct = CardProduct.fromPokemonTCG(externalData);
            break;
        case 'yugioh':
            cardProduct = CardProduct.fromYGOPRODECK(externalData);
            break;
        default:
            // Generic creation
            cardProduct = new CardProduct({
                externalId,
                name: externalData.name,
                game,
                set: externalData.set || externalData.set_name || '',
                setCode: externalData.setCode || externalData.set || '',
                number: externalData.number || externalData.collector_number || '',
                rarity: externalData.rarity || '',
                type: externalData.type || externalData.type_line || '',
                imageUrl: externalData.imageUrl || externalData.image || externalData.images?.small || ''
            });
    }

    products.push(cardProduct.toJSON());
    await saveCardProducts(products);

    console.log(`✅ CardProduct created: ${cardProduct.name} (${game})`);
    return cardProduct.toJSON();
}

/**
 * Get CardProduct by ID
 */
export async function getCardProductById(cardProductId) {
    const products = await loadCardProducts();
    return products.find(p => p.id === cardProductId) || null;
}

/**
 * Get CardProduct by external ID and game
 */
export async function getCardProductByExternalId(externalId, game) {
    const products = await loadCardProducts();
    const canonicalId = `card_${game}_${externalId}`;
    return products.find(p => p.id === canonicalId) || null;
}

/**
 * Search CardProducts with filters
 */
export async function searchCardProducts(filters = {}) {
    let products = await loadCardProducts();

    // Filter by game
    if (filters.game) {
        products = products.filter(p => p.game === filters.game);
    }

    // Filter by set
    if (filters.set) {
        const setLower = filters.set.toLowerCase();
        products = products.filter(p =>
            p.set?.toLowerCase().includes(setLower) ||
            p.setCode?.toLowerCase().includes(setLower)
        );
    }

    // Filter by rarity
    if (filters.rarity) {
        products = products.filter(p => p.rarity === filters.rarity);
    }

    // Search by name
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        products = products.filter(p =>
            p.name.toLowerCase().includes(searchLower)
        );
    }

    // Sort
    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'asc';

    products.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
            comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'marketPrice') {
            comparison = (a.marketPrice || 0) - (b.marketPrice || 0);
        } else if (sortBy === 'createdAt') {
            comparison = new Date(a.createdAt) - new Date(b.createdAt);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    return products;
}

/**
 * Update market prices for a CardProduct
 */
export async function updateCardProductPrices(cardProductId, priceData) {
    const products = await loadCardProducts();
    const productIndex = products.findIndex(p => p.id === cardProductId);

    if (productIndex === -1) {
        throw new Error('CardProduct not found');
    }

    // Update prices
    products[productIndex].marketPrice = priceData.marketPrice;
    products[productIndex].lowPrice = priceData.lowPrice;
    products[productIndex].highPrice = priceData.highPrice;
    if (priceData.foilMarketPrice !== undefined) {
        products[productIndex].foilMarketPrice = priceData.foilMarketPrice;
    }
    products[productIndex].priceUpdatedAt = new Date().toISOString();
    products[productIndex].updatedAt = new Date().toISOString();

    await saveCardProducts(products);

    console.log(`✅ Prices updated for ${products[productIndex].name}: $${priceData.marketPrice}`);
    return products[productIndex];
}

/**
 * Update listing count for a CardProduct
 */
export async function updateListingCount(cardProductId, count) {
    const products = await loadCardProducts();
    const productIndex = products.findIndex(p => p.id === cardProductId);

    if (productIndex !== -1) {
        products[productIndex].totalListings = count;
        products[productIndex].updatedAt = new Date().toISOString();
        await saveCardProducts(products);
    }
}

/**
 * Get all unique sets for a game
 */
export async function getSetsByGame(game) {
    const products = await loadCardProducts();
    const gameProducts = products.filter(p => p.game === game);

    const sets = [...new Set(gameProducts.map(p => p.set).filter(Boolean))];
    return sets.sort();
}

/**
 * Get all unique rarities for a game
 */
export async function getRaritiesByGame(game) {
    const products = await loadCardProducts();
    const gameProducts = products.filter(p => p.game === game);

    const rarities = [...new Set(gameProducts.map(p => p.rarity).filter(Boolean))];
    return rarities.sort();
}

export default {
    getOrCreateCardProduct,
    getCardProductById,
    getCardProductByExternalId,
    searchCardProducts,
    updateCardProductPrices,
    updateListingCount,
    getSetsByGame,
    getRaritiesByGame
};
