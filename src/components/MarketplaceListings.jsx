import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import './MarketplaceListings.css';

const MarketplaceListings = ({ cardId, currentPrice }) => {
    const { addToCart } = useCart();
    const [listings, setListings] = useState([]);
    const [sortBy, setSortBy] = useState('price');

    useEffect(() => {
        // Generate mock listings
        const mockListings = [
            {
                id: 1,
                seller: 'CardMaster Store',
                rating: 4.9,
                totalSales: 15420,
                price: currentPrice * 0.95,
                condition: 'NM',
                quantity: 3,
                shippingTime: '2-3 dias',
                certified: true
            },
            {
                id: 2,
                seller: 'TCG Pro Shop',
                rating: 4.8,
                totalSales: 8340,
                price: currentPrice * 1.02,
                condition: 'NM',
                quantity: 1,
                shippingTime: '3-5 dias',
                certified: true
            },
            {
                id: 3,
                seller: 'Magic Cards BR',
                rating: 4.7,
                totalSales: 5200,
                price: currentPrice * 0.98,
                condition: 'LP',
                quantity: 2,
                shippingTime: '2-4 dias',
                certified: false
            },
            {
                id: 4,
                seller: 'Collector Zone',
                rating: 4.9,
                totalSales: 12000,
                price: currentPrice,
                condition: 'NM',
                quantity: 5,
                shippingTime: '1-2 dias',
                certified: true
            },
            {
                id: 5,
                seller: 'Card Paradise',
                rating: 4.6,
                totalSales: 3100,
                price: currentPrice * 1.05,
                condition: 'NM',
                quantity: 1,
                shippingTime: '4-6 dias',
                certified: false
            }
        ];

        const sorted = [...mockListings].sort((a, b) => {
            if (sortBy === 'price') return a.price - b.price;
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'shipping') return parseInt(a.shippingTime) - parseInt(b.shippingTime);
            return 0;
        });

        setListings(sorted);
    }, [cardId, currentPrice, sortBy]);

    const handleAddListing = (listing) => {
        addToCart({
            id: cardId,
            name: 'Card from listing',
            price: listing.price,
            condition: listing.condition,
            seller: listing.seller,
            image: ''
        });
    };

    return (
        <div className="marketplace-listings">
            < div className="listings-header" >
                <div className="listings-count">
                    {listings.length} anúncios disponíveis
                </div>
                <div className="listings-sort">
                    <label>Ordenar por:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="price">Menor preço</option>
                        <option value="rating">Melhor avaliação</option>
                        <option value="shipping">Envio mais rápido</option>
                    </select>
                </div>
            </div >

            <div className="listings-table">
                <div className="listings-table-header">
                    <div className="col-seller">Vendedor</div>
                    <div className="col-condition">Condição</div>
                    <div className="col-price">Preço</div>
                    <div className="col-shipping">Envio</div>
                    <div className="col-action"></div>
                </div>

                {listings.map(listing => (
                    <div key={listing.id} className="listing-row">
                        <div className="col-seller">
                            <div className="seller-info">
                                <div className="seller-name">
                                    {listing.seller}
                                    {listing.certified && (
                                        <span className="certified-badge" title="Vendedor Certificado">
                                            ✓
                                        </span>
                                    )}
                                </div>
                                <div className="seller-rating">
                                    <Star size={14} className="star-icon" fill="currentColor" />
                                    <span>{listing.rating}</span>
                                    <span className="sales-count">({listing.totalSales.toLocaleString('pt-BR')} vendas)</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-condition">
                            <span className="condition-badge">{listing.condition}</span>
                            <span className="quantity-text">{listing.quantity} disponível</span>
                        </div>
                        <div className="col-price">
                            <span className="listing-price">R$ {listing.price.toFixed(2)}</span>
                        </div>
                        <div className="col-shipping">
                            <span className="shipping-time">{listing.shippingTime}</span>
                        </div>
                        <div className="col-action">
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleAddListing(listing)}
                            >
                                <ShoppingCart size={16} />
                                Adicionar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default MarketplaceListings;
