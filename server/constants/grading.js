/**
 * Standardized Grading Constants for TCG Marketplace
 * Based on TCGPlayer/Cardmarket industry standards
 */

// Condition Enum - Strict grading system
export const CONDITION = {
    NM: 'near_mint',
    LP: 'lightly_played',
    MP: 'moderately_played',
    HP: 'heavily_played',
    DMG: 'damaged'
};

export const CONDITION_LABELS = {
    near_mint: 'Near Mint (NM)',
    lightly_played: 'Lightly Played (LP)',
    moderately_played: 'Moderately Played (MP)',
    heavily_played: 'Heavily Played (HP)',
    damaged: 'Damaged (DMG)'
};

export const CONDITION_SHORT = {
    near_mint: 'NM',
    lightly_played: 'LP',
    moderately_played: 'MP',
    heavily_played: 'HP',
    damaged: 'DMG'
};

// Price modifiers based on condition (relative to NM)
export const CONDITION_PRICE_MODIFIER = {
    near_mint: 1.0,
    lightly_played: 0.85,
    moderately_played: 0.70,
    heavily_played: 0.50,
    damaged: 0.30
};

// Language Enum
export const LANGUAGE = {
    EN: 'en',
    PT: 'pt',
    ES: 'es',
    JP: 'jp',
    KR: 'kr',
    CN: 'cn',
    DE: 'de',
    FR: 'fr',
    IT: 'it'
};

export const LANGUAGE_LABELS = {
    en: 'English',
    pt: 'Português',
    es: 'Español',
    jp: '日本語',
    kr: '한국어',
    cn: '中文',
    de: 'Deutsch',
    fr: 'Français',
    it: 'Italiano'
};

// Game Types
export const GAME_TYPE = {
    MAGIC: 'magic',
    POKEMON: 'pokemon',
    YUGIOH: 'yugioh',
    LORCANA: 'lorcana',
    ONEPIECE: 'onepiece'
};

export const GAME_LABELS = {
    magic: 'Magic: The Gathering',
    pokemon: 'Pokémon TCG',
    yugioh: 'Yu-Gi-Oh!',
    lorcana: 'Disney Lorcana',
    onepiece: 'One Piece Card Game'
};

// Rarity mappings (normalized across games)
export const RARITY = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    MYTHIC: 'mythic',
    ULTRA_RARE: 'ultra_rare',
    SECRET_RARE: 'secret_rare',
    SPECIAL: 'special'
};

// Validation helpers
export function isValidCondition(condition) {
    return Object.values(CONDITION).includes(condition);
}

export function isValidLanguage(language) {
    return Object.values(LANGUAGE).includes(language);
}

export function isValidGame(game) {
    return Object.values(GAME_TYPE).includes(game);
}

export default {
    CONDITION,
    CONDITION_LABELS,
    CONDITION_SHORT,
    CONDITION_PRICE_MODIFIER,
    LANGUAGE,
    LANGUAGE_LABELS,
    GAME_TYPE,
    GAME_LABELS,
    RARITY,
    isValidCondition,
    isValidLanguage,
    isValidGame
};
