/**
 * Seller Inventory Page - FullFoil
 * 
 * Inventory management for sellers with bulk actions.
 */

import React, { useState, useEffect } from 'react';
import { API_URLS } from '../../config/api';
import authService from '../../services/authService';
import './SellerDashboard.css';

function SellerInventoryPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedListings, setSelectedListings] = useState([]);

    useEffect(() => {
        fetchListings();
    }, [filter]);

    const fetchListings = async () => {
        try {
            const token = authService.getToken();
            const url = filter === 'all'
                ? `${API_URLS.CATALOG}/listings/`
                : `${API_URLS.CATALOG}/listings/?status=${filter}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setListings(data.results || data);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateListing = async (listingId, updates) => {
        try {
            const token = authService.getToken();
            const response = await fetch(`${API_URLS.CATALOG}/listings/${listingId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                fetchListings();
            }
        } catch (error) {
            console.error('Error updating listing:', error);
        }
    };

    const bulkAction = async (action) => {
        if (selectedListings.length === 0) return;

        const updates = action === 'activate'
            ? { status: 'active' }
            : { status: 'inactive' };

        for (const id of selectedListings) {
            await updateListing(id, updates);
        }

        setSelectedListings([]);
    };

    const toggleSelect = (id) => {
        setSelectedListings(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedListings.length === listings.length) {
            setSelectedListings([]);
        } else {
            setSelectedListings(listings.map(l => l.id));
        }
    };

    if (loading) {
        return (
            <div className="seller-inventory loading">
                <div className="spinner"></div>
                <p>Carregando inventário...</p>
            </div>
        );
    }

    return (
        <div className="seller-inventory">
            <header className="page-header">
                <h1>Gerenciar Inventário</h1>
                <div className="header-actions">
                    <a href="#/seller/dashboard" className="back-link">
                        ← Voltar ao Dashboard
                    </a>
                    <a href="#/create-listing" className="btn-primary">
                        + Nova Listagem
                    </a>
                </div>
            </header>

            <div className="inventory-toolbar">
                <div className="status-filters">
                    {['all', 'active', 'inactive', 'sold_out'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {getStatusLabel(status)}
                        </button>
                    ))}
                </div>

                {selectedListings.length > 0 && (
                    <div className="bulk-actions">
                        <span>{selectedListings.length} selecionados</span>
                        <button onClick={() => bulkAction('activate')} className="btn-secondary">
                            Ativar
                        </button>
                        <button onClick={() => bulkAction('deactivate')} className="btn-secondary">
                            Desativar
                        </button>
                    </div>
                )}
            </div>

            <table className="inventory-table">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={selectedListings.length === listings.length && listings.length > 0}
                                onChange={selectAll}
                            />
                        </th>
                        <th>Card</th>
                        <th>Condição</th>
                        <th>Preço</th>
                        <th>Qtd</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {listings.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="empty-state">
                                Nenhuma listagem encontrada
                            </td>
                        </tr>
                    ) : (
                        listings.map(listing => (
                            <tr key={listing.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedListings.includes(listing.id)}
                                        onChange={() => toggleSelect(listing.id)}
                                    />
                                </td>
                                <td className="card-cell">
                                    <img
                                        src={listing.product?.image_url || '/placeholder.png'}
                                        alt={listing.product?.name}
                                        className="card-thumb"
                                    />
                                    <span>{listing.product?.name || 'Card'}</span>
                                </td>
                                <td>
                                    {getConditionLabel(listing.condition)}
                                    {listing.is_foil && ' ✨'}
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        defaultValue={listing.price}
                                        step="0.01"
                                        className="price-input"
                                        onBlur={(e) => {
                                            const newPrice = parseFloat(e.target.value);
                                            if (newPrice !== listing.price) {
                                                updateListing(listing.id, { price: newPrice });
                                            }
                                        }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        defaultValue={listing.quantity}
                                        min="0"
                                        className="qty-input"
                                        onBlur={(e) => {
                                            const newQty = parseInt(e.target.value);
                                            if (newQty !== listing.quantity) {
                                                updateListing(listing.id, { quantity: newQty });
                                            }
                                        }}
                                    />
                                </td>
                                <td>
                                    <span className={`status-badge ${listing.status}`}>
                                        {getStatusLabel(listing.status)}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="action-btn"
                                        onClick={() => updateListing(listing.id, {
                                            status: listing.status === 'active' ? 'inactive' : 'active'
                                        })}
                                    >
                                        {listing.status === 'active' ? 'Pausar' : 'Ativar'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

function getStatusLabel(status) {
    const labels = {
        all: 'Todos',
        active: 'Ativo',
        inactive: 'Inativo',
        sold_out: 'Esgotado',
        pending: 'Pendente'
    };
    return labels[status] || status;
}

function getConditionLabel(condition) {
    const labels = {
        near_mint: 'NM',
        lightly_played: 'LP',
        moderately_played: 'MP',
        heavily_played: 'HP',
        damaged: 'DMG'
    };
    return labels[condition] || condition;
}

export default SellerInventoryPage;
