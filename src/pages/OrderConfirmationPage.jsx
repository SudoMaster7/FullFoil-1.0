import React, { useEffect, useState } from 'react';
import { useOrders } from '../contexts/OrderContext';
import { getOrder } from '../services/orderService';
import './OrderConfirmationPage.css';

function OrderConfirmationPage() {
    // Get orderId from hash (#/orders/ORDER_ID)
    const orderId = window.location.hash.split('/').pop();
    const { getOrderById } = useOrders();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const goHome = () => {
        window.location.hash = '#/';
    };

    const goToOrders = () => {
        window.location.hash = '#/orders';
    };

    useEffect(() => {
        const loadOrder = async () => {
            try {
                // Try local context first
                let orderData = getOrderById(orderId);

                // If not found, try to fetch from API
                if (!orderData) {
                    const response = await getOrder(orderId);
                    orderData = response.order;
                }

                setOrder(orderData);
            } catch (error) {
                console.error('Error loading order:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [orderId, getOrderById]);

    if (loading) {
        return (
            <div className="order-confirmation-page">
                <div className="loading">Carregando...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-confirmation-page">
                <div className="order-not-found">
                    <h2>Pedido não encontrado</h2>
                    <button onClick={goHome} className="btn-primary">
                        Voltar para Home
                    </button>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: '#fbbf24',
            processing: '#3b82f6',
            shipped: '#8b5cf6',
            delivered: '#10b981',
            cancelled: '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Pendente',
            processing: 'Processando',
            shipped: 'Enviado',
            delivered: 'Entregue',
            cancelled: 'Cancelado'
        };
        return texts[status] || status;
    };

    return (
        <div className="order-confirmation-page">
            <div className="confirmation-container">
                {/* Success Header */}
                <div className="success-header">
                    <div className="success-icon">✅</div>
                    <h1>Pedido Realizado com Sucesso!</h1>
                    <p>Obrigado por comprar na FullFoil</p>
                    <div className="order-number">
                        Pedido #{order.orderNumber}
                    </div>
                </div>

                {/* Order Details */}
                <div className="order-details-grid">
                    {/* Order Info */}
                    <div className="detail-section">
                        <h3>📋 Informações do Pedido</h3>
                        <div className="detail-row">
                            <span>Status:</span>
                            <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                                {getStatusText(order.status)}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span>Data:</span>
                            <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="detail-row">
                            <span>Total:</span>
                            <span className="price">R$ {order.totals.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="detail-section">
                        <h3>📦 Envio</h3>
                        <div className="shipping-address">
                            <p><strong>{order.shipping.fullName}</strong></p>
                            <p>{order.shipping.address}</p>
                            <p>{order.shipping.city} - {order.shipping.state}</p>
                            <p>CEP: {order.shipping.zipCode}</p>
                            <p>{order.shipping.email}</p>
                            <p>{order.shipping.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="order-items-section">
                    <h3>🎴 Itens do Pedido ({order.items.length})</h3>
                    <div className="items-list">
                        {order.items.map((item, index) => (
                            <div key={index} className="order-item">
                                <img src={item.image} alt={item.name} />
                                <div className="item-info">
                                    <div className="item-name">{item.name}</div>
                                    <div className="item-game">{item.game}</div>
                                    <div className="item-qty">Quantidade: {item.quantity}</div>
                                </div>
                                <div className="item-price">
                                    R$ {(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className="price-breakdown">
                    <div className="price-row">
                        <span>Subtotal:</span>
                        <span>R$ {order.totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="price-row">
                        <span>Frete:</span>
                        <span>R$ {order.totals.shipping.toFixed(2)}</span>
                    </div>
                    <div className="price-row">
                        <span>Impostos:</span>
                        <span>R$ {order.totals.tax.toFixed(2)}</span>
                    </div>
                    <div className="price-row total">
                        <span>Total:</span>
                        <span>R$ {order.totals.total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="confirmation-actions">
                    <button onClick={goToOrders} className="btn-secondary">
                        Ver Meus Pedidos
                    </button>
                    <button onClick={goHome} className="btn-primary">
                        Continuar Comprando
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderConfirmationPage;
