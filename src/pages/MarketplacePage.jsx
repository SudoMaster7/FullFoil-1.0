import React, { useState, useEffect } from 'react';
import { getAllListings } from '../services/listingService';
import toast from 'react-hot-toast';
import './MarketplacePage.css';

function MarketplacePage() {
    const [listings, setListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        game: '',
        search: '',
        minPrice: '',
        maxPrice: '',
        condition: '',
        foil: ''
    });

    useEffect(() => {
        loadListings();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, listings]);

    const loadListings = async () => {
        try {
            setLoading(true);
            const data = await getAllListings({ status: 'active' });
            setListings(data);
            setFilteredListings(data);
        } catch (error) {
            toast.error('Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...listings];

        if (filters.game) {
            result = result.filter(l => l.cardData.game === filters.game);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(l =>
                l.cardData.name.toLowerCase().includes(searchLower)
            );
        }

        if (filters.minPrice) {
            result = result.filter(l => l.price >= parseFloat(filters.minPrice));
        }

        if (filters.maxPrice) {
            result = result.filter(l => l.price <= parseFloat(filters.maxPrice));
        }

        if (filters.condition) {
            result = result.filter(l => l.condition === filters.condition);
        }

        if (filters.foil) {
            result = result.filter(l => l.foil === (filters.foil === 'true'));
        }

        setFilteredListings(result);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    const clearFilters = () => {
        setFilters({
            game: '',
            search: '',
            minPrice: '',
            maxPrice: '',
            condition: '',
            foil: ''
        });
    };

    const addToCart = (listing) => {
        toast.success(`${listing.cardData.name} adicionado ao carrinho!`);
        // TODO: Implementar addToCart com listing
    };

    if (loading) {
        return (
            <div className="marketplace-page">
                <div className="loading">Carregando produtos...</div>
            </div>
        );
    }

    return (
        <div className="marketplace-page">
            <div className="marketplace-header">
                <h1>🛒 Marketplace</h1>
                <p>Compre cartas de vendedores verificados</p>
            </div>

            <div className="marketplace-container">
                {/* Filters Sidebar */}
                <aside className="filters-sidebar">
                    <div className="filters-header">
                        <h2>Filtros</h2>
                        <button onClick={clearFilters} className="btn-clear">
                            Limpar
                        </button>
                    </div>

                    <div className="filter-group">
                        <label>Buscar</label>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Nome da carta..."
                        />
                    </div>

                    <div className="filter-group">
                        <label>Jogo</label>
                        <select name="game" value={filters.game} onChange={handleFilterChange}>
                            <option value="">Todos</option>
                            <option value="magic">Magic: The Gathering</option>
                            <option value="pokemon">Pokémon TCG</option>
                            <option value="yugioh">Yu-Gi-Oh!</option>
                            <option value="lorcana">Disney Lorcana</option>
                            <option value="onepiece">One Piece</option>
                            <option value="fab">Flesh and Blood</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Preço Mínimo</label>
                        <input
                            type="number"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            placeholder="R$ 0.00"
                            step="0.01"
                        />
                    </div>

                    <div className="filter-group">
                        <label>Preço Máximo</label>
                        <input
                            type="number"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            placeholder="R$ 999.00"
                            step="0.01"
                        />
                    </div>

                    <div className="filter-group">
                        <label>Condição</label>
                        <select name="condition" value={filters.condition} onChange={handleFilterChange}>
                            <option value="">Todas</option>
                            <option value="near_mint">Near Mint</option>
                            <option value="lightly_played">Lightly Played</option>
                            <option value="moderately_played">Moderately Played</option>
                            <option value="heavily_played">Heavily Played</option>
                            <option value="damaged">Damaged</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Foil</label>
                        <select name="foil" value={filters.foil} onChange={handleFilterChange}>
                            <option value="">Todas</option>
                            <option value="true">Sim</option>
                            <option value="false">Não</option>
                        </select>
                    </div>
                </aside>

                {/* Listings Grid */}
                <main className="listings-content">
                    <div className="results-header">
                        <h3>{filteredListings.length} produtos encontrados</h3>
                    </div>

                    {filteredListings.length === 0 ? (
                        <div className="no-results">
                            <p>Nenhum produto encontrado com os filtros selecionados.</p>
                            <button onClick={clearFilters} className="btn btn-primary">
                                Limpar Filtros
                            </button>
                        </div>
                    ) : (
                        <div className="listings-grid">
                            {filteredListings.map(listing => (
                                <div key={listing.id} className="listing-card">
                                    {listing.cardData.imageUrl && (
                                        <div className="listing-image">
                                            <img src={listing.cardData.imageUrl} alt={listing.cardData.name} />
                                            {listing.foil && <span className="foil-badge">✨ Foil</span>}
                                        </div>
                                    )}

                                    <div className="listing-info">
                                        <h3>{listing.cardData.name}</h3>
                                        <p className="listing-game">{listing.cardData.game}</p>
                                        {listing.cardData.set && (
                                            <p className="listing-set">{listing.cardData.set}</p>
                                        )}

                                        <div className="listing-details">
                                            <span className="condition">{listing.condition.replace('_', ' ')}</span>
                                            <span className="quantity">Qtd: {listing.quantity}</span>
                                        </div>

                                        <div className="listing-footer">
                                            <div className="price">R$ {listing.price.toFixed(2)}</div>
                                            <button
                                                onClick={() => addToCart(listing)}
                                                className="btn btn-primary btn-sm"
                                            >
                                                Adicionar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default MarketplacePage;
