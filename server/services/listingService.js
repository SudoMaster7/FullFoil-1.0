import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Listing from '../models/Listing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Load listings from file
async function loadListings() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(LISTINGS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save listings to file
async function saveListings(listings) {
    await ensureDataDir();
    await fs.writeFile(LISTINGS_FILE, JSON.stringify(listings, null, 2), 'utf-8');
}

/**
 * Create a new listing
 */
export async function createListing(listingData) {
    try {
        const listings = await loadListings();

        const listing = new Listing(listingData);
        listings.push(listing);
        await saveListings(listings);

        console.log(`✅ Listing created: ${listing.cardData.name} by seller ${listing.sellerId}`);
        return listing;
    } catch (error) {
        console.error('Error creating listing:', error);
        throw error;
    }
}

/**
 * Get listing by ID
 */
export async function getListingById(listingId) {
    try {
        const listings = await loadListings();
        return listings.find(l => l.id === listingId) || null;
    } catch (error) {
        console.error('Error getting listing:', error);
        throw error;
    }
}

/**
 * Get all listings with filters
 */
export async function getAllListings(filters = {}) {
    try {
        let listings = await loadListings();

        // Filter by seller
        if (filters.sellerId) {
            listings = listings.filter(l => l.sellerId === filters.sellerId);
        }

        // Filter by game
        if (filters.game) {
            listings = listings.filter(l => l.cardData.game === filters.game);
        }

        // Filter by status
        if (filters.status) {
            listings = listings.filter(l => l.status === filters.status);
        } else {
            // Default: only active listings
            listings = listings.filter(l => l.status === 'active');
        }

        // Filter by condition
        if (filters.condition) {
            listings = listings.filter(l => l.condition === filters.condition);
        }

        // Filter by foil
        if (filters.foil !== undefined) {
            listings = listings.filter(l => l.foil === (filters.foil === 'true' || filters.foil === true));
        }

        // Filter by price range
        if (filters.minPrice) {
            listings = listings.filter(l => l.price >= parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
            listings = listings.filter(l => l.price <= parseFloat(filters.maxPrice));
        }

        // Search by card name
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            listings = listings.filter(l =>
                l.cardData.name.toLowerCase().includes(searchLower)
            );
        }

        // Sort
        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'desc';

        listings.sort((a, b) => {
            let comparison = 0;

            if (sortBy === 'price') {
                comparison = a.price - b.price;
            } else if (sortBy === 'quantity') {
                comparison = a.quantity - b.quantity;
            } else if (sortBy === 'createdAt') {
                comparison = new Date(a.createdAt) - new Date(b.createdAt);
            } else if (sortBy === 'views') {
                comparison = a.views - b.views;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return listings;
    } catch (error) {
        console.error('Error getting listings:', error);
        throw error;
    }
}

/**
 * Search listings by card
 */
export async function searchListingsByCard(cardId, filters = {}) {
    try {
        let listings = await loadListings();

        // Filter by cardId
        listings = listings.filter(l => l.cardId === cardId && l.status === 'active');

        // Apply additional filters
        if (filters.condition) {
            listings = listings.filter(l => l.condition === filters.condition);
        }
        if (filters.foil !== undefined) {
            listings = listings.filter(l => l.foil === (filters.foil === 'true' || filters.foil === true));
        }

        // Sort by price (lowest first by default)
        listings.sort((a, b) => a.price - b.price);

        return listings;
    } catch (error) {
        console.error('Error searching listings:', error);
        throw error;
    }
}

/**
 * Update listing
 */
export async function updateListing(listingId, updates) {
    try {
        const listings = await loadListings();
        const listingIndex = listings.findIndex(l => l.id === listingId);

        if (listingIndex === -1) {
            throw new Error('Listing não encontrado');
        }

        // Update allowed fields
        const allowedFields = ['quantity', 'condition', 'price', 'status', 'language', 'foil'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                listings[listingIndex][field] = updates[field];
            }
        });

        // Update status based on quantity
        if (updates.quantity !== undefined) {
            listings[listingIndex].status = updates.quantity > 0 ? 'active' : 'sold_out';
        }

        listings[listingIndex].updatedAt = new Date().toISOString();

        await saveListings(listings);
        return listings[listingIndex];
    } catch (error) {
        console.error('Error updating listing:', error);
        throw error;
    }
}

/**
 * Delete listing
 */
export async function deleteListing(listingId) {
    try {
        const listings = await loadListings();
        const filteredListings = listings.filter(l => l.id !== listingId);

        if (filteredListings.length === listings.length) {
            throw new Error('Listing não encontrado');
        }

        await saveListings(filteredListings);
        console.log(`✅ Listing deleted: ${listingId}`);
        return true;
    } catch (error) {
        console.error('Error deleting listing:', error);
        throw error;
    }
}

/**
 * Decrement listing quantity (when sold)
 */
export async function decrementListingQuantity(listingId, amount = 1) {
    try {
        const listings = await loadListings();
        const listingIndex = listings.findIndex(l => l.id === listingId);

        if (listingIndex === -1) {
            throw new Error('Listing não encontrado');
        }

        const listing = new Listing(listings[listingIndex]);
        listing.decrementQuantity(amount);

        listings[listingIndex] = listing.toJSON();
        await saveListings(listings);

        return listings[listingIndex];
    } catch (error) {
        console.error('Error decrementing listing quantity:', error);
        throw error;
    }
}

export default {
    createListing,
    getListingById,
    getAllListings,
    searchListingsByCard,
    updateListing,
    deleteListing,
    decrementListingQuantity
};
