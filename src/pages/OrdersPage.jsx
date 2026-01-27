import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../contexts/OrderContext';
import { getAllOrders } from '../services/orderService';
import './OrdersPage.css';

function OrdersPage() {
    const { user } = useAuth();
    const { orders, loading, refreshOrders, setOrders, setLoading } = useOrders();

    const goHome = () => {
        window.location.hash = '#/';
    };

    const goToOrder = (orderId) => {
        window.location.hash = `#/orders/${orderId}`;
    };

    useEffect(() => {
        // Load orders filtered by user if logged in
        const loadOrders = async () => {
            if (user) {
                setLoading(true);
                try {
                    const response = await getAllOrders(user.id);
                    setOrders(response.orders || []);
                } catch (error) {
                    console.error('Error loading orders:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                // If not logged in, try to refresh from localStorage
                refreshOrders();
            }
        };

        loadOrders();
    }, [user]);

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

    if (loading) {
        return (
            <div className="orders-page">
                <div className="loading">Carregando pedidos...</div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="orders-container">
                <div className="orders-header">
                    <h1>📦 Meus Pedidos</h1>
                    <p>Acompanhe todos os seus pedidos</p>
                </div>

                {(orders || []).length === 0 ? (
                    <div className="no-orders">
                        <div className="no-orders-icon">🛒</div>
                        <h2>Você ainda não fez nenhum pedido</h2>
                        <p>Quando você realizar uma compra, seus pedidos aparecerão aqui.</p>
                        <button onClick={goHome} className="btn-primary">
                            Começar a Comprar
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {(orders || []).map((order) => (
                            <div
                                key={order.id}
                                className="order-card"
                                onClick={() => goToOrder(order.id)}
                            >
                                <div className="order-card-header">
                                    <div className="order-info">
                                        <div className="order-number">#{order.orderNumber}</div>
                                        <div className="order-date">
                                            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <div
                                        className="order-status"
                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                    >
                                        {getStatusText(order.status)}
                                    </div>
                                </div>

                                <div className="order-card-items">
                                    <div className="items-preview">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <img
                                                key={idx}
                                                src={item.image}
                                                alt={item.name}
                                                className="item-preview-image"
                                            />
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className="more-items">
                                                +{order.items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <div className="items-summary">
                                        {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                                    </div>
                                </div>

                                <div className="order-card-footer">
                                    <div className="order-total">
                                        <span>Total:</span>
                                        <span className="price">R$ {order.totals.total.toFixed(2)}</span>
                                    </div>
                                    <button className="btn-view-details">
                                        Ver Detalhes →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrdersPage;
