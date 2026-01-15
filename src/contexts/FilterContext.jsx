import React, { createContext, useContext, useState, useEffect } from 'react';
import scryfallService from '../services/scryfallService';
import pokemonTCGService from '../services/pokemonTCGService';
import yugiohService from '../services/yugiohService';
import lorcanaService from '../services/lorcanaService';
import onePieceService from '../services/onePieceService';

const FilterContext = createContext();

export const useFilters = () => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilters must be used within FilterProvider');
    }
    return context;
};

export const FilterProvider = ({ children, initialGame = 'magic' }) => {
    const [filters, setFilters] = useState({
        condition: [],
        rarity: [],
        priceRange: { min: 0, max: 10000 },
        colors: [],
        types: [],
        set: null,
    });

    const [activeGame, setActiveGame] = useState(initialGame);
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCards, setTotalCards] = useState(0);
    const [sortBy, setSortBy] = useState('newest');

    // Update activeGame when initialGame prop changes
    useEffect(() => {
        if (initialGame && initialGame !== activeGame) {
            setActiveGame(initialGame);
            // Clear products and filters when switching games
            setAllProducts([]);
            setFilteredProducts([]);
            clearFilters();
        }
    }, [initialGame]);

    // Fetch cards from API when game changes
    useEffect(() => {
        if (activeGame) {
            fetchCards();
        }
    }, [activeGame]);

    // Apply filters and sorting to already fetched products
    useEffect(() => {
        applyFilters();
    }, [filters, allProducts, sortBy]);

    const fetchCards = async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            let result;

            switch (activeGame) {
                case 'magic':
                    result = await scryfallService.searchCards(filters, page);
                    break;
                case 'pokemon':
                    result = await pokemonTCGService.searchCards(filters, page);
                    break;
                case 'yugioh':
                    result = await yugiohService.searchCards(filters, page);
                    break;
                case 'lorcana':
                    result = await lorcanaService.searchCards(filters, page);
                    break;
                case 'onepiece':
                    result = await onePieceService.searchCards(filters, page);
                    break;
                default:
                    result = await scryfallService.searchCards(filters, page);
            }

            setAllProducts(result.cards);
            setHasMore(result.hasMore);
            setTotalCards(result.totalCards);
            setCurrentPage(page);
        } catch (err) {
            console.error('Error fetching cards:', err);
            setError(err.message);
            setAllProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchCards(true);
        }
    };

    const goToPage = (page) => {
        const pageSize = 50;
        const maxPage = Math.ceil(totalCards / pageSize);
        if (page >= 1 && page <= maxPage && page !== currentPage) {
            fetchCards(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getTotalPages = () => {
        const pageSize = 50;
        return Math.ceil(totalCards / pageSize) || 1;
    };

    const applyFilters = () => {
        let result = [...allProducts];

        // Filter by condition
        if (filters.condition.length > 0) {
            result = result.filter(product =>
                filters.condition.includes(product.condition)
            );
        }

        // Filter by rarity
        if (filters.rarity.length > 0) {
            result = result.filter(product =>
                filters.rarity.includes(product.rarity)
            );
        }

        // Filter by price range
        result = result.filter(product =>
            product.price >= filters.priceRange.min &&
            product.price <= filters.priceRange.max
        );

        // Filter by colors (Magic specific)
        if (filters.colors.length > 0) {
            result = result.filter(product => {
                if (!product.colors) return false;
                return filters.colors.some(color => product.colors.includes(color));
            });
        }

        // Filter by types
        if (filters.types.length > 0) {
            result = result.filter(product =>
                filters.types.includes(product.type)
            );
        }

        // Filter by set
        if (filters.set) {
            result = result.filter(product => product.set === filters.set);
        }

        // Apply sorting
        result = applySorting(result);

        setFilteredProducts(result);
    };

    const getRarityValue = (rarity) => {
        const rarityMap = {
            'Common': 1,
            'Uncommon': 2,
            'Rare': 3,
            'Mythic': 4,
            'Mythic Rare': 4,
            'Holo Rare': 3,
            'Ultra Rare': 4,
            'Secret Rare': 5
        };
        return rarityMap[rarity] || 0;
    };

    const applySorting = (products) => {
        const sorted = [...products];

        switch (sortBy) {
            case 'price-asc':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return sorted.sort((a, b) => b.price - a.price);
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case 'rarity-asc':
                return sorted.sort((a, b) => getRarityValue(a.rarity) - getRarityValue(b.rarity));
            case 'rarity-desc':
                return sorted.sort((a, b) => getRarityValue(b.rarity) - getRarityValue(a.rarity));
            case 'newest':
            default:
                return sorted;
        }
    };

    const setFilter = (category, value) => {
        setFilters(prev => ({
            ...prev,
            [category]: value
        }));
    };

    const toggleFilter = (category, value) => {
        setFilters(prev => {
            const current = prev[category];
            if (current.includes(value)) {
                return {
                    ...prev,
                    [category]: current.filter(v => v !== value)
                };
            } else {
                return {
                    ...prev,
                    [category]: [...current, value]
                };
            }
        });
    };

    const clearFilters = () => {
        setFilters({
            condition: [],
            rarity: [],
            priceRange: { min: 0, max: 10000 },
            colors: [],
            types: [],
            set: null,
        });
    };

    const clearFilter = (category) => {
        if (category === 'priceRange') {
            setFilters(prev => ({
                ...prev,
                priceRange: { min: 0, max: 10000 }
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [category]: Array.isArray(prev[category]) ? [] : null
            }));
        }
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.condition.length > 0) count++;
        if (filters.rarity.length > 0) count++;
        if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count++;
        if (filters.colors.length > 0) count++;
        if (filters.types.length > 0) count++;
        if (filters.set) count++;
        return count;
    };

    const value = {
        filters,
        activeGame,
        allProducts,
        filteredProducts,
        loading,
        error,
        hasMore,
        totalCards,
        currentPage,
        sortBy,
        setFilter,
        toggleFilter,
        clearFilters,
        clearFilter,
        setActiveGame,
        setAllProducts,
        getActiveFiltersCount,
        fetchCards,
        goToPage,
        getTotalPages,
        setSortBy,
    };

    return (
        <FilterContext.Provider value={value}>
            {children}
        </FilterContext.Provider>
    );
};
