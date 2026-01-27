import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import SaleHistory from '../models/SaleHistory.js';
import { updateCardProductPrices } from './cardProductService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const SALES_FILE = path.join(DATA_DIR, 'saleHistory.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Load sale history from file
async function loadSaleHistory() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(SALES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save sale history to file
async function saveSaleHistory(sales) {
    await ensureDataDir();
    await fs.writeFile(SALES_FILE, JSON.stringify(sales, null, 2), 'utf-8');
}

/**
 * Record a sale when an order is completed
 * This is called by orderService after successful checkout
 */
export async function recordSale({
    cardProductId,
    listingId,
    sellerId,
    buyerId,
    orderId,
    price,
    quantity,
    condition,
    language,
    foil
}) {
    const sales = await loadSaleHistory();

    const sale = new SaleHistory({
        cardProductId,
        listingId,
        sellerId,
        buyerId,
        orderId,
        price,
        quantity,
        condition,
        language,
        foil
    });

    sales.push(sale.toJSON());
    await saveSaleHistory(sales);

    console.log(`📈 Sale recorded: ${cardProductId} @ $${price} x${quantity}`);

    // Trigger market price update
    await updateMarketPrice(cardProductId);

    return sale;
}

/**
 * Calculate and update market price for a CardProduct
 * Uses 7-day rolling average of completed sales
 */
export async function updateMarketPrice(cardProductId) {
    const sales = await loadSaleHistory();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get recent sales for this card (non-foil)
    const recentSales = sales.filter(sale =>
        sale.cardProductId === cardProductId &&
        !sale.foil &&
        new Date(sale.soldAt) >= sevenDaysAgo
    );

    // Get recent foil sales
    const recentFoilSales = sales.filter(sale =>
        sale.cardProductId === cardProductId &&
        sale.foil &&
        new Date(sale.soldAt) >= sevenDaysAgo
    );

    if (recentSales.length === 0 && recentFoilSales.length === 0) {
        console.log(`No recent sales for ${cardProductId}, skipping price update`);
        return null;
    }

    const priceData = {};

    // Calculate non-foil prices
    if (recentSales.length > 0) {
        const prices = recentSales.map(s => s.price);
        priceData.marketPrice = parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2));
        priceData.lowPrice = parseFloat(Math.min(...prices).toFixed(2));
        priceData.highPrice = parseFloat(Math.max(...prices).toFixed(2));
    }

    // Calculate foil prices
    if (recentFoilSales.length > 0) {
        const foilPrices = recentFoilSales.map(s => s.price);
        priceData.foilMarketPrice = parseFloat((foilPrices.reduce((a, b) => a + b, 0) / foilPrices.length).toFixed(2));
    }

    // Update CardProduct with new prices
    try {
        const updated = await updateCardProductPrices(cardProductId, priceData);
        console.log(`💰 Market price updated: ${cardProductId} -> $${priceData.marketPrice}`);
        return updated;
    } catch (error) {
        console.error(`Failed to update market price for ${cardProductId}:`, error);
        return null;
    }
}

/**
 * Get sales history for a CardProduct
 */
export async function getSalesHistory(cardProductId, days = 30) {
    const sales = await loadSaleHistory();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return sales
        .filter(sale =>
            sale.cardProductId === cardProductId &&
            new Date(sale.soldAt) >= cutoffDate
        )
        .sort((a, b) => new Date(b.soldAt) - new Date(a.soldAt));
}

/**
 * Get price statistics for a CardProduct
 */
export async function getPriceStats(cardProductId) {
    const sales = await loadSaleHistory();

    const cardSales = sales.filter(s => s.cardProductId === cardProductId);

    if (cardSales.length === 0) {
        return null;
    }

    const prices = cardSales.map(s => s.price);
    const last30Days = cardSales.filter(s => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        return new Date(s.soldAt) >= cutoff;
    });

    return {
        totalSales: cardSales.length,
        last30DaysSales: last30Days.length,
        allTimeAvg: parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)),
        allTimeLow: parseFloat(Math.min(...prices).toFixed(2)),
        allTimeHigh: parseFloat(Math.max(...prices).toFixed(2)),
        latestSale: cardSales.sort((a, b) => new Date(b.soldAt) - new Date(a.soldAt))[0]
    };
}

/**
 * Batch update all market prices (can be run as scheduled task)
 */
export async function updateAllMarketPrices() {
    const sales = await loadSaleHistory();

    // Get unique cardProductIds with recent sales
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCardIds = [...new Set(
        sales
            .filter(s => new Date(s.soldAt) >= sevenDaysAgo)
            .map(s => s.cardProductId)
    )];

    console.log(`Updating market prices for ${recentCardIds.length} cards...`);

    for (const cardId of recentCardIds) {
        await updateMarketPrice(cardId);
    }

    console.log('✅ All market prices updated');
}

export default {
    recordSale,
    updateMarketPrice,
    getSalesHistory,
    getPriceStats,
    updateAllMarketPrices
};
