import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../config/stripe';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../contexts/OrderContext';
import CheckoutForm from '../components/checkout/CheckoutForm';
import OrderSummary from '../components/checkout/OrderSummary';
import './CheckoutPage.css';

function CheckoutPage() {
    const { cartItems, totalAmount, clearCart } = useCart();
    const { addOrder } = useOrders();
    const [processing, setProcessing] = useState(false);

    const goBack = () => {
        window.history.back();
    };

    const goHome = () => {
        window.location.hash = '#/';
    };

    // If cart is empty, redirect to home
    if (cartItems.length === 0) {
        return (
            <div className="checkout-page">
                <div className="checkout-container">
                    <div className="empty-cart-message">
                        <h2>🛒 Seu carrinho está vazio</h2>
                        <p>Adicione alguns produtos antes de finalizar a compra.</p>
                        <button onClick={goHome} className="btn-primary">
                            Voltar para Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleCheckoutComplete = async (orderData) => {
        try {
            setProcessing(true);
            const order = await addOrder(orderData);

            // Clear cart after successful order
            clearCart();

            // Redirect to order confirmation
            window.location.hash = `#/orders/${order.id}`;
        } catch (error) {
            console.error('Order creation error:', error);
            alert('Erro ao criar pedido. Tente novamente.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <div className="checkout-header">
                    <button onClick={goBack} className="back-button">
                        ← Voltar
                    </button>
                    <h1>Finalizar Compra</h1>
                </div>

                <div className="checkout-content">
                    <div className="checkout-main">
                        <Elements stripe={stripePromise}>
                            <CheckoutForm
                                cartItems={cartItems}
                                totalAmount={totalAmount}
                                onComplete={handleCheckoutComplete}
                                processing={processing}
                            />
                        </Elements>
                    </div>

                    <div className="checkout-sidebar">
                        <OrderSummary cartItems={cartItems} totalAmount={totalAmount} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;
