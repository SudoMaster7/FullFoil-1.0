/**
 * Seller Dashboard Page - FullFoil
 * 
 * Main dashboard for sellers with sales overview, stats, and quick actions.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URLS } from '../config/api';
import authService from '../services/authService';
import './seller/SellerDashboard.css';

function SellerDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalSales: 0,
        activeListings: 0,
        pendingOrders: 0,
        averageRating: 0,
        totalReviews: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);
    const [seller, setSeller] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = authService.getToken();

            // Fetch seller profile
            const sellersRes = await fetch(`${API_URLS.CATALOG}/sellers/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const sellersData = await sellersRes.json();
            const sellerData = (sellersData.results || sellersData)[0];
            setSeller(sellerData);

            if (sellerData) {
                // Fetch seller listings
                const listingsRes = await fetch(
                    `${API_URLS.CATALOG}/sellers/${sellerData.id}/listings/`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                const listingsData = await listingsRes.json();
                const listings = listingsData.results || listingsData;

                // Fetch orders (seller orders)
                const ordersRes = await fetch(`${API_URLS.CATALOG}/orders/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const ordersData = await ordersRes.json();
                const orders = ordersData.results || ordersData;

                setStats({
                    totalSales: sellerData.total_sales || 0,
                    activeListings: listings.filter(l => l.status === 'active').length,
                    pendingOrders: orders.filter(o =>
                        o.status === 'paid' || o.status === 'processing'
                    ).length,
                    averageRating: sellerData.rating || 0,
                    totalReviews: sellerData.total_reviews || 0,
                    recentOrders: orders.slice(0, 5)
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="seller-dashboard loading">
                <div className="spinner"></div>
                <p>Carregando dashboard...</p>
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="seller-dashboard no-seller">
                <h2>Você ainda não é um vendedor</h2>
                <p>Cadastre-se como vendedor para acessar o dashboard.</p>
                <a href="#/become-seller" className="btn-primary">
                    Tornar-se Vendedor
                </a>
            </div>
        );
    }

    return (
        <div className="seller-dashboard">
            <header className="dashboard-header">
                <div className="seller-info">
                    <h1>Olá, {seller.business_name}!</h1>
                    <p className="seller-rating">
                        ⭐ {stats.averageRating.toFixed(1)} ({stats.totalReviews} avaliações)
                    </p>
                </div>
                <div className="quick-actions">
                    <a href="#/seller/inventory" className="btn-secondary">
                        Gerenciar Inventário
                    </a>
                    <a href="#/create-listing" className="btn-primary">
                        + Nova Listagem
                    </a>
                </div>
            </header>

            <section className="stats-grid">
                <div className="stat-card sales">
                    <span className="stat-icon">💰</span>
                    <div className="stat-content">
                        <h3>Vendas Totais</h3>
                        <span className="stat-value">{stats.totalSales}</span>
                    </div>
                </div>

                <div className="stat-card listings">
                    <span className="stat-icon">📦</span>
                    <div className="stat-content">
                        <h3>Listagens Ativas</h3>
                        <span className="stat-value">{stats.activeListings}</span>
                    </div>
                </div>

                <div className="stat-card pending">
                    <span className="stat-icon">⏳</span>
                    <div className="stat-content">
                        <h3>Pedidos Pendentes</h3>
                        <span className="stat-value">{stats.pendingOrders}</span>
                    </div>
                </div>

                <div className="stat-card rating">
                    <span className="stat-icon">⭐</span>
                    <div className="stat-content">
                        <h3>Avaliação Média</h3>
                        <span className="stat-value">{stats.averageRating.toFixed(1)}</span>
                    </div>
                </div>
            </section>

            <section className="dashboard-sections">
                <div className="section recent-orders">
                    <div className="section-header">
                        <h2>Pedidos Recentes</h2>
                        <a href="#/seller/orders">Ver todos →</a>
                    </div>

                    {stats.recentOrders.length === 0 ? (
                        <p className="empty-state">Nenhum pedido ainda</p>
                    ) : (
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Pedido</th>
                                    <th>Cliente</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.order_number}</td>
                                        <td>{order.shipping_name}</td>
                                        <td>
                                            <span className={`status-badge ${order.status}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td>R$ {order.total}</td>
                                        <td>
                                            <a href={`#/seller/orders/${order.id}`}>
                                                Ver detalhes
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="section quick-tips">
                    <h2>Dicas Rápidas</h2>
                    <ul>
                        <li>📸 Listagens com fotos vendem 40% mais rápido</li>
                        <li>💬 Responda avaliações para aumentar confiança</li>
                        <li>📦 Envie rápido para melhorar sua reputação</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}

function getStatusLabel(status) {
    const labels = {
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

export default SellerDashboardPage;
