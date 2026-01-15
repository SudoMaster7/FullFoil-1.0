import express from 'express';
import { getCache, setCache, generateCacheKey } from '../utils/cache.js';

const router = express.Router();

// Mock data completo - PokemonTCG API está offline
const pokemonMockCards = [
    { id: 'sv1-1', name: 'Sprigatito', supertype: 'Pokémon', subtypes: ['Basic'], hp: '60', types: ['Grass'], rarity: 'Common', set: { id: 'sv1', name: 'Scarlet & Violet', series: 'Scarlet & Violet', releaseDate: '2023/03/31' }, images: { small: 'https://images.pokemontcg.io/sv1/1.png', large: 'https://images.pokemontcg.io/sv1/1_hires.png' }, cardmarket: { prices: { averageSellPrice: 0.50 } } },
    { id: 'sv1-14', name: 'Meowscarada ex', supertype: 'Pokémon', subtypes: ['Stage 2', 'ex'], hp: '310', types: ['Grass'], rarity: 'Double Rare', set: { id: 'sv1', name: 'Scarlet & Violet', series: 'Scarlet & Violet', releaseDate: '2023/03/31' }, images: { small: 'https://images.pokemontcg.io/sv1/14.png', large: 'https://images.pokemontcg.io/sv1/14_hires.png' }, cardmarket: { prices: { averageSellPrice: 12.50 } } },
    { id: 'sv1-25', name: 'Fuecoco', supertype: 'Pokémon', subtypes: ['Basic'], hp: '70', types: ['Fire'], rarity: 'Common', set: { id: 'sv1', name: 'Scarlet & Violet', series: 'Scarlet & Violet', releaseDate: '2023/03/31' }, images: { small: 'https://images.pokemontcg.io/sv1/25.png', large: 'https://images.pokemontcg.io/sv1/25_hires.png' }, cardmarket: { prices: { averageSellPrice: 0.75 } } },
    { id: 'sv1-38', name: 'Skeledirge ex', supertype: 'Pokémon', subtypes: ['Stage 2', 'ex'], hp: '330', types: ['Fire'], rarity: 'Double Rare', set: { id: 'sv1', name: 'Scarlet & Violet', series: 'Scarlet & Violet', releaseDate: '2023/03/31' }, images: { small: 'https://images.pokemontcg.io/sv1/38.png', large: 'https://images.pokemontcg.io/sv1/38_hires.png' }, cardmarket: { prices: { averageSellPrice: 15.00 } } },
    { id: 'sv1-52', name: 'Quaxly', supertype: 'Pokémon', subtypes: ['Basic'], hp: '60', types: ['Water'], rarity: 'Common', set: { id: 'sv1', name: 'Scarlet & Violet', series: 'Scarlet & Violet', releaseDate: '2023/03/31' }, images: { small: 'https://images.pokemontcg.io/sv1/52.png', large: 'https://images.pokemontcg.io/sv1/52_hires.png' }, cardmarket: { prices: { averageSellPrice: 0.60 } } },
    { id: 'sv1-64', name: 'Quaquaval ex', supertype: 'Pokémon', subtypes: ['Stage 2', 'ex'], hp: '320', types: ['Water'], rarity: 'Double Rare', set: { id: 'sv1', name: 'Scarlet & Violet', series: 'Scarlet & Violet', releaseDate: '2023/03/31' }, images: { small: 'https://images.pokemontcg.io/sv1/64.png', large: 'https://images.pokemontcg.io/sv1/64_hires.png' }, cardmarket: { prices: { averageSellPrice: 10.00 } } },
    { id: 'sv1-100', name: 'Pikachu', supertype: 'Pokémon', subtypes: ['Basic'], hp: '70', types: ['Lightning'], rarity: 'Common', set: { id: 'sv1', name: 'Scarlet & Violet', series: 'Scarlet & Violet', releaseDate: '2023/03/31' }, images: { small: 'https://images.pokemontcg.io/sv1/100.png', large: 'https://images.pokemontcg.io/sv1/100_hires.png' }, cardmarket: { prices: { averageSellPrice: 2.50 } } },
    { id: 'sv1-125', name: 'Gardevoir ex', supertype: 'Pokémon', subtypes: ['Stage 2', 'ex'], hp: '310', types: ['Psychic'], rarity: 'Double Rare', set: { id: 'sv1', name: 'Scarlet & Violet', series: 'Scarlet & Violet', releaseDate: '2023/03/31' }, images: { small: 'https://images.pokemontcg.io/sv1/125.png', large: 'https://images.pokemontcg.io/sv1/125_hires.png' }, cardmarket: { prices: { averageSellPrice: 25.00 } } },
    { id: 'sv2-6', name: 'Charizard ex', supertype: 'Pokémon', subtypes: ['Stage 2', 'ex'], hp: '330', types: ['Fire'], rarity: 'Double Rare', set: { id: 'sv2', name: 'Paldea Evolved', series: 'Scarlet & Violet', releaseDate: '2023/06/09' }, images: { small: 'https://images.pokemontcg.io/sv2/6.png', large: 'https://images.pokemontcg.io/sv2/6_hires.png' }, cardmarket: { prices: { averageSellPrice: 45.00 } } },
    { id: 'sv3-172', name: 'Charizard ex', supertype: 'Pokémon', subtypes: ['Stage 2', 'ex', 'Tera'], hp: '340', types: ['Fire', 'Darkness'], rarity: 'Special Illustration Rare', set: { id: 'sv3', name: 'Obsidian Flames', series: 'Scarlet & Violet', releaseDate: '2023/08/11' }, images: { small: 'https://images.pokemontcg.io/sv3/172.png', large: 'https://images.pokemontcg.io/sv3/172_hires.png' }, cardmarket: { prices: { averageSellPrice: 150.00 } } },
    { id: 'sv4-1', name: 'Squirtle', supertype: 'Pokémon', subtypes: ['Basic'], hp: '70', types: ['Water'], rarity: 'Common', set: { id: 'sv4', name: 'Paradox Rift', series: 'Scarlet & Violet', releaseDate: '2023/11/03' }, images: { small: 'https://images.pokemontcg.io/sv4/1.png', large: 'https://images.pokemontcg.io/sv4/1_hires.png' }, cardmarket: { prices: { averageSellPrice: 0.70 } } },
    { id: 'sv4-50', name: 'Blastoise ex', supertype: 'Pokémon', subtypes: ['Stage 2', 'ex'], hp: '340', types: ['Water'], rarity: 'Double Rare', set: { id: 'sv4', name: 'Paradox Rift', series: 'Scarlet & Violet', releaseDate: '2023/11/03' }, images: { small: 'https://images.pokemontcg.io/sv4/50.png', large: 'https://images.pokemontcg.io/sv4/50_hires.png' }, cardmarket: { prices: { averageSellPrice: 18.00 } } },
    { id: 'swsh1-55', name: 'Eevee', supertype: 'Pokémon', subtypes: ['Basic'], hp: '60', types: ['Colorless'], rarity: 'Common', set: { id: 'swsh1', name: 'Sword & Shield', series: 'Sword & Shield', releaseDate: '2020/02/07' }, images: { small: 'https://images.pokemontcg.io/swsh1/55.png', large: 'https://images.pokemontcg.io/swsh1/55_hires.png' }, cardmarket: { prices: { averageSellPrice: 1.50 } } },
    { id: 'swsh9-94', name: 'Umbreon ex', supertype: 'Pokémon', subtypes: ['Stage 1', 'ex'], hp: '260', types: ['Darkness'], rarity: 'Double Rare', set: { id: 'swsh9', name: 'Brilliant Stars', series: 'Sword & Shield', releaseDate: '2022/02/25' }, images: { small: 'https://images.pokemontcg.io/swsh9/94.png', large: 'https://images.pokemontcg.io/swsh9/94_hires.png' }, cardmarket: { prices: { averageSellPrice: 22.00 } } },
    { id: 'xy1-53', name: 'Mewtwo', supertype: 'Pokémon', subtypes: ['Basic'], hp: '130', types: ['Psychic'], rarity: 'Rare', set: { id: 'xy1', name: 'XY', series: 'XY', releaseDate: '2014/02/05' }, images: { small: 'https://images.pokemontcg.io/xy1/53.png', large: 'https://images.pokemontcg.io/xy1/53_hires.png' }, cardmarket: { prices: { averageSellPrice: 5.00 } } },
    { id: 'base1-4', name: 'Charizard', supertype: 'Pokémon', subtypes: ['Stage 2'], hp: '120', types: ['Fire'], rarity: 'Rare Holo', set: { id: 'base1', name: 'Base Set', series: 'Base', releaseDate: '1999/01/09' }, images: { small: 'https://images.pokemontcg.io/base1/4.png', large: 'https://images.pokemontcg.io/base1/4_hires.png' }, cardmarket: { prices: { averageSellPrice: 350.00 } } },
    { id: 'base1-25', name: 'Pikachu', supertype: 'Pokémon', subtypes: ['Basic'], hp: '40', types: ['Lightning'], rarity: 'Common', set: { id: 'base1', name: 'Base Set', series: 'Base', releaseDate: '1999/01/09' }, images: { small: 'https://images.pokemontcg.io/base1/25.png', large: 'https://images.pokemontcg.io/base1/25_hires.png' }, cardmarket: { prices: { averageSellPrice: 15.00 } } },
    { id: 'base1-2', name: 'Blastoise', supertype: 'Pokémon', subtypes: ['Stage 2'], hp: '100', types: ['Water'], rarity: 'Rare Holo', set: { id: 'base1', name: 'Base Set', series: 'Base', releaseDate: '1999/01/09' }, images: { small: 'https://images.pokemontcg.io/base1/2.png', large: 'https://images.pokemontcg.io/base1/2_hires.png' }, cardmarket: { prices: { averageSellPrice: 120.00 } } },
    { id: 'base1-15', name: 'Venusaur', supertype: 'Pokémon', subtypes: ['Stage 2'], hp: '100', types: ['Grass'], rarity: 'Rare Holo', set: { id: 'base1', name: 'Base Set', series: 'Base', releaseDate: '1999/01/09' }, images: { small: 'https://images.pokemontcg.io/base1/15.png', large: 'https://images.pokemontcg.io/base1/15_hires.png' }, cardmarket: { prices: { averageSellPrice: 95.00 } } },
    { id: 'sv7-200', name: 'Rayquaza ex', supertype: 'Pokémon', subtypes: ['Basic', 'ex'], hp: '220', types: ['Dragon'], rarity: 'Hyper Rare', set: { id: 'sv7', name: 'Stellar Crown', series: 'Scarlet & Violet', releaseDate: '2024/09/13' }, images: { small: 'https://images.pokemontcg.io/sv7/200.png', large: 'https://images.pokemontcg.io/sv7/200_hires.png' }, cardmarket: { prices: { averageSellPrice: 120.00 } } }
];

// GET /api/pokemon/cards
router.get('/cards', async (req, res) => {
    try {
        const cacheKey = generateCacheKey('pokemon:cards', req.query);
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        console.log('Pokemon: Using mock data (API offline)');

        const data = {
            data: pokemonMockCards,
            page: 1,
            pageSize: 20,
            count: pokemonMockCards.length,
            totalCount: pokemonMockCards.length
        };

        setCache(cacheKey, data);
        res.json(data);
    } catch (error) {
        console.error('Pokemon mock data error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch Pokemon cards',
            message: error.message
        });
    }
});

// GET /api/pokemon/cards/random
router.get('/cards/random', async (req, res) => {
    try {
        const pageSize = parseInt(req.query.count) || 12;
        const shuffled = [...pokemonMockCards].sort(() => 0.5 - Math.random());
        const randomCards = shuffled.slice(0, pageSize);

        res.json({
            data: randomCards,
            count: randomCards.length
        });
    } catch (error) {
        console.error('Pokemon random mock data error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch random Pokemon cards',
            message: error.message
        });
    }
});

export default router;
