import React from 'react';
import './OrderSummary.css';

function OrderSummary({ cartItems, totalAmount }) {
    const subtotal = totalAmount;
    const shipping = 15.00; // Fixed shipping for MVP
    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + shipping + tax;

    return (
        <div className="order-summary">
            <h2>Resumo do Pedido</h2>

            <div className="order-items">
                {cartItems.map((item) => (
                    <div key={item.id} className="order-item">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="order-item-image"
                        />
                        <div className="order-item-info">
                            <div className="order-item-name">{item.name}</div>
                            <div className="order-item-game">{item.game}</div>
                            <div className="order-item-quantity">Qtd: {item.quantity}</div>
                        </div>
                        <div className="order-item-price">
                            R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="order-totals">
                <div className="total-row">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                    <span>Frete</span>
                    <span>R$ {shipping.toFixed(2)}</span>
                </div>
                <div className="total-row">
                    <span>Impostos (10%)</span>
                    <span>R$ {tax.toFixed(2)}</span>
                </div>
                <div className="total-row total-final">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                </div>
            </div>

            <div className="order-security">
                <div className="security-badge">
                    <span className="security-icon">🔒</span>
                    <div className="security-text">
                        <strong>Pagamento Seguro</strong>
                        <p>Powered by Stripe</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderSummary;
