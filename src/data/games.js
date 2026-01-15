// Game categories data
export const GAMES = [
    {
        id: 'magic',
        name: 'Magic: The Gathering',
        shortName: 'Magic',
        icon: '🔮',
        color: '#FF8C00',
        sets: [
            { name: 'Foundations', featured: true },
            { name: 'Duskmourn: House of Horror', featured: true },
            { name: 'Bloomburrow', featured: false },
            { name: 'Modern Horizons 3', featured: false },
        ]
    },
    {
        id: 'pokemon',
        name: 'Pokémon',
        shortName: 'Pokémon',
        icon: '⚡',
        color: '#FFCB05',
        sets: [
            { name: 'Prismatic Evolutions', featured: true },
            { name: 'Surging Sparks', featured: true },
            { name: 'Stellar Crown', featured: false },
            { name: 'Shrouded Fable', featured: false },
        ]
    },
    {
        id: 'yugioh',
        name: 'Yu-Gi-Oh!',
        shortName: 'Yu-Gi-Oh!',
        icon: '🎴',
        color: '#9333EA',
        sets: [
            { name: 'Rage of the Abyss', featured: true },
            { name: 'Phantom Nightmare', featured: true },
            { name: 'Age of Overlord', featured: false },
        ]
    },
    {
        id: 'lorcana',
        name: 'Disney Lorcana',
        shortName: 'Lorcana',
        icon: '✨',
        color: '#3B82F6',
        sets: [
            { name: 'Azurite Sea', featured: true },
            { name: 'Shimmering Skies', featured: true },
            { name: 'Ursula\'s Return', featured: false },
        ]
    },
    {
        id: 'onepiece',
        name: 'One Piece Card Game',
        shortName: 'One Piece',
        icon: '🏴‍☠️',
        color: '#EF4444',
        sets: [
            { name: 'OP-09 Four Emperors', featured: true },
            { name: 'OP-08 Two Legends', featured: true },
            { name: 'OP-07 500 Years', featured: false },
        ]
    }
];

export const getGameById = (id) => GAMES.find(game => game.id === id);
export const getFeaturedSets = (gameId) => {
    const game = getGameById(gameId);
    return game ? game.sets.filter(set => set.featured) : [];
};
