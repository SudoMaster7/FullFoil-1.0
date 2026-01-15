import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import './CartItem.css';

const CartItem = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();

    const handleDecrease = () => {
        if (item.quantity > 1) {
            updateQuantity(item.id, item.quantity - 1);
        } else {
            removeFromCart(item.id);
        }
    };

    const handleIncrease = () => {
        if (item.quantity < 99) {
            updateQuantity(item.id, item.quantity + 1);
        }
    };

    return (
        <div className="cart-item">
            <div className="cart-item-image">
                <img
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    loading="lazy"
                />
            </div>

            <div className="cart-item-details">
                <div className="cart-item-header">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remover item"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="cart-item-meta">
                    <span className="cart-item-set">{item.set}</span>
                    <span className="cart-item-condition">{item.condition}</span>
                    <span className="cart-item-rarity">{item.rarity}</span>
                </div>

                <div className="cart-item-footer">
                    <div className="quantity-controls">
                        <button
                            className="qty-btn"
                            onClick={handleDecrease}
                            aria-label="Diminuir quantidade"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button
                            className="qty-btn"
                            onClick={handleIncrease}
                            aria-label="Aumentar quantidade"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="cart-item-pricing">
                        <span className="unit-price">R$ {item.price.toFixed(2)}</span>
                        {item.quantity > 1 && (
                            <span className="total-price">
                                R$ {(item.price * item.quantity).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
