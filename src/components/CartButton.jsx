import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import './CartButton.css';

const CartButton = () => {
    const { cart, toggleCart } = useCart();

    return (
        <button
            className="cart-button"
            onClick={toggleCart}
            aria-label="Carrinho de compras"
        >
            <ShoppingCart size={24} />
            {cart.itemCount > 0 && (
                <span className="cart-badge">{cart.itemCount}</span>
            )}
        </button>
    );
};

export default CartButton;
