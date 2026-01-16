import React from 'react';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import CartItem from './CartItem';
import './CartDrawer.css';

const CartDrawer = () => {
    const { cart, isCartOpen, setIsCartOpen, clearCart } = useCart();

    if (!isCartOpen) return null;

    return (
        <>
            <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
            <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <div className="cart-header-title">
                        <ShoppingCart size={24} />
                        <h2>Carrinho ({cart.itemCount})</h2>
                    </div>
                    <button
                        className="btn-icon"
                        onClick={() => setIsCartOpen(false)}
                        aria-label="Fechar carrinho"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="cart-content">
                    {cart.items.length === 0 ? (
                        <div className="cart-empty">
                            <ShoppingCart size={64} />
                            <p>Seu carrinho está vazio</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setIsCartOpen(false)}
                            >
                                Continuar Comprando
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="cart-items">
                                {cart.items.map(item => (
                                    <CartItem key={item.id} item={item} />
                                ))}
                            </div>

                            <div className="cart-footer">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={clearCart}
                                >
                                    <Trash2 size={16} />
                                    Limpar Carrinho
                                </button>

                                <div className="cart-summary">
                                    <div className="summary-row">
                                        <span>Subtotal:</span>
                                        <span className="summary-value">
                                            R$ {cart.subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Impostos:</span>
                                        <span className="summary-value text-muted">
                                            R$ {cart.tax.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="summary-row summary-total">
                                        <span>Total:</span>
                                        <span className="summary-value">
                                            R$ {cart.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        window.location.hash = '#/checkout';
                                    }}
                                >
                                    Finalizar Compra
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartDrawer;
