/**
 * Seller Orders Page - FullFoil
 * 
 * Order management for sellers with status updates and shipping.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URLS } from '../../config/api';
import authService from '../../services/authService';
import './SellerDashboard.css';

function SellerOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        try {
            const token = authService.getToken();
            const url = filter === 'all'
                ? `${API_URLS.CATALOG}/orders/`
                : `${API_URLS.CATALOG}/orders/?status=${filter}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setOrders(data.results || data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus, trackingNumber = '') => {
        try {
            const token = authService.getToken();
            const body = { status: newStatus };
            if (trackingNumber) {
                body.tracking_number = trackingNumber;
            }

            const response = await fetch(`${API_URLS.CATALOG}/orders/${orderId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                fetchOrders();
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const StatusFilter = () => (
        <div className="status-filters">
            {['all', 'paid', 'processing', 'shipped', 'delivered'].map(status => (
                <button
                    key={status}
                    className={`filter-btn ${filter === status ? 'active' : ''}`}
                    onClick={() => setFilter(status)}
                >
                    {getStatusLabel(status)}
                </button>
            ))}
        </div>
    );

    const OrderCard = ({ order }) => (
        <div className="order-card" onClick={() => setSelectedOrder(order)}>
            <div className="order-header">
                <span className="order-number">#{order.order_number}</span>
                <span className={`status-badge ${order.status}`}>
                    {getStatusLabel(order.status)}
                </span>
            </div>

            <div className="order-details">
                <div className="customer-info">
                    <strong>Cliente:</strong> {order.shipping_name}
                    <br />
                    <small>
                        {order.shipping_city}, {order.shipping_state}
                    </small>
                </div>

                <div className="order-items">
                    {order.items?.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="item-name">
                            {item.product_name} x{item.quantity}
                        </span>
                    ))}
                    {order.items?.length > 2 && (
                        <span className="more-items">
                            +{order.items.length - 2} itens
                        </span>
                    )}
                </div>

                <div className="order-total">
                    <strong>R$ {order.total}</strong>
                </div>
            </div>

            <div className="order-date">
                {new Date(order.created_at).toLocaleDateString('pt-BR')}
            </div>
        </div>
    );

    const OrderModal = ({ order, onClose }) => {
        const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <button className="modal-close" onClick={onClose}>×</button>

                    <h2>Pedido #{order.order_number}</h2>

                    <div className="order-info-grid">
                        <div className="info-section">
                            <h3>Cliente</h3>
                            <p>{order.shipping_name}</p>
                            <p>{order.shipping_address}</p>
                            <p>{order.shipping_city}, {order.shipping_state}</p>
                            <p>CEP: {order.shipping_zip}</p>
                        </div>

                        <div className="info-section">
                            <h3>Itens</h3>
                            <ul>
                                {order.items?.map((item, idx) => (
                                    <li key={idx}>
                                        {item.product_name} ({item.condition})
                                        <br />
                                        <small>R$ {item.price} x {item.quantity}</small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="order-actions">
                        <h3>Atualizar Status</h3>

                        {order.status === 'paid' && (
                            <button
                                className="btn-primary"
                                onClick={() => updateOrderStatus(order.id, 'processing')}
                            >
                                ✓ Iniciar Processamento
                            </button>
                        )}

                        {order.status === 'processing' && (
                            <div className="shipping-form">
                                <input
                                    type="text"
                                    placeholder="Código de rastreamento"
                                    value={trackingNumber}
                                    onChange={e => setTrackingNumber(e.target.value)}
                                />
                                <button
                                    className="btn-primary"
                                    onClick={() => updateOrderStatus(order.id, 'shipped', trackingNumber)}
                                >
                                    📦 Marcar como Enviado
                                </button>
                            </div>
                        )}

                        {order.status === 'shipped' && order.tracking_number && (
                            <div className="tracking-info">
                                <p>Rastreamento: <strong>{order.tracking_number}</strong></p>
                                <a
                                    href={`https://www.linkcorreios.com.br/?id=${order.tracking_number}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Rastrear no Correios →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="seller-orders loading">
                <div className="spinner"></div>
                <p>Carregando pedidos...</p>
            </div>
        );
    }

    return (
        <div className="seller-orders">
            <header className="page-header">
                <h1>Gerenciar Pedidos</h1>
                <a href="#/seller/dashboard" className="back-link">
                    ← Voltar ao Dashboard
                </a>
            </header>

            <StatusFilter />

            <div className="orders-grid">
                {orders.length === 0 ? (
                    <p className="empty-state">Nenhum pedido encontrado</p>
                ) : (
                    orders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))
                )}
            </div>

            {selectedOrder && (
                <OrderModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}

function getStatusLabel(status) {
    const labels = {
        all: 'Todos',
        pending: 'Aguardando Pagamento',
        paid: 'Pago',
        processing: 'Processando',
        shipped: 'Enviado',
        delivered: 'Entregue',
        cancelled: 'Cancelado',
        refunded: 'Reembolsado'
    };
    return labels[status] || status;
}

export default SellerOrdersPage;
