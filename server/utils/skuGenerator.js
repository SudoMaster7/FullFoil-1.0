import { CONDITION_SHORT } from '../constants/grading.js';

/**
 * SKU Generator for TCG Marketplace
 * 
 * SKU Format: {GAME}_{CARDID}-{CONDITION}-{LANG}-{FOIL}
 * Example: MTG_abc123-NM-EN-F (Magic card, Near Mint, English, Foil)
 */

/**
 * Generate unique SKU for a listing
 * @param {string} cardProductId - The canonical card product ID
 * @param {string} condition - Condition enum value (near_mint, lightly_played, etc)
 * @param {string} language - Language code (en, pt, jp, etc)
 * @param {boolean} foil - Whether the card is foil/holographic
 * @returns {string} - Generated SKU
 */
export function generateSKU(cardProductId, condition, language, foil) {
    const conditionCode = CONDITION_SHORT[condition] || condition.substring(0, 2).toUpperCase();
    const langCode = language.toUpperCase();
    const foilCode = foil ? 'F' : 'NF';

    return `${cardProductId}-${conditionCode}-${langCode}-${foilCode}`;
}

/**
 * Parse a SKU back into its components
 * @param {string} sku - The SKU to parse
 * @returns {object|null} - Parsed components or null if invalid
 */
export function parseSKU(sku) {
    if (!sku || typeof sku !== 'string') return null;

    const parts = sku.split('-');
    if (parts.length < 4) return null;

    // Last 3 parts are always: CONDITION-LANG-FOIL
    const foilPart = parts.pop();
    const langPart = parts.pop();
    const condPart = parts.pop();

    // Rest is the cardProductId (may contain dashes)
    const cardProductId = parts.join('-');

    // Map condition code back to full value
    const conditionMap = {
        'NM': 'near_mint',
        'LP': 'lightly_played',
        'MP': 'moderately_played',
        'HP': 'heavily_played',
        'DMG': 'damaged'
    };

    return {
        cardProductId,
        condition: conditionMap[condPart] || condPart.toLowerCase(),
        language: langPart.toLowerCase(),
        foil: foilPart === 'F'
    };
}

/**
 * Validate if a SKU is well-formed
 * @param {string} sku - The SKU to validate
 * @returns {boolean} - Whether the SKU is valid
 */
export function isValidSKU(sku) {
    const parsed = parseSKU(sku);
    if (!parsed) return false;

    const validConditions = ['NM', 'LP', 'MP', 'HP', 'DMG'];
    const validLanguages = ['EN', 'PT', 'ES', 'JP', 'KR', 'CN', 'DE', 'FR', 'IT'];

    const parts = sku.split('-');
    if (parts.length < 4) return false;

    const foilPart = parts.pop();
    const langPart = parts.pop();
    const condPart = parts.pop();

    return (
        validConditions.includes(condPart) &&
        validLanguages.includes(langPart) &&
        (foilPart === 'F' || foilPart === 'NF')
    );
}

export default {
    generateSKU,
    parseSKU,
    isValidSKU
};
