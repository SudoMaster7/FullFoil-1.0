import React from 'react';
import { Plus, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import './Card.css';

const Card = ({ card }) => {
    const { addToCart, isInCart } = useCart();
    const inCart = isInCart(card.id);

    const handleAddToCart = (e) => {
        e.stopPropagation(); // Prevent click from bubble to card
        addToCart(card);
    };

    const handleCardClick = () => {
        // Store card data in sessionStorage for detail page
        sessionStorage.setItem('currentCard', JSON.stringify(card));
        // Navigate to card detail page
        window.location.hash = `/${card.game}/card/${card.id}`;
    };

    return (
        <div className="card-item" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className="card-image-container">
                <img src={card.image} alt={card.name} className="card-image" />
                <div className="card-overlay">
                    <button
                        className={`btn ${inCart ? 'btn-success' : 'btn-primary'} icon-btn card-add-btn`}
                        onClick={handleAddToCart}
                        title={inCart ? 'Já no carrinho' : 'Adicionar ao carrinho'}
                    >
                        {inCart ? <Check size={20} /> : <Plus size={20} />}
                    </button>
                </div>
            </div>
            <div className="card-details">
                <div className="card-meta">
                    <span className="card-set">{card.set}</span>
                    <span className={`card-rarity ${card.rarity.toLowerCase()}`}>{card.rarity}</span>
                </div>
                <h3 className="card-name">{card.name}</h3>
                <div className="card-footer">
                    <div className="card-price">
                        <span className="price-label">Preço de Mercado</span>
                        <span className="price-value">R$ {card.price.toFixed(2)}</span>
                    </div>
                    <div className="card-condition-badge">{card.condition}</div>
                </div>
            </div>
        </div>
    );
};

export default Card;
