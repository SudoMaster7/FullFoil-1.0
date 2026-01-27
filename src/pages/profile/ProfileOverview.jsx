import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserProfileLayout from './UserProfileLayout';
import userService from '../../services/userService';
import { useOrders } from '../../contexts/OrderContext';
import { Package, MapPin } from 'lucide-react';

function ProfileOverview() {
    const { user } = useAuth();
    const { orders } = useOrders(); // Assuming orders are loaded in context
    const [defaultAddress, setDefaultAddress] = useState(null);

    useEffect(() => {
        loadDefaultAddress();
    }, []);

    const loadDefaultAddress = async () => {
        try {
            const addresses = await userService.getAddresses();
            const def = addresses.find(a => a.is_default) || addresses[0];
            setDefaultAddress(def);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <UserProfileLayout activePage="overview">
            <h2>Visão Geral</h2>
            <p className="subtitle">Bem-vindo de volta, {user?.first_name}!</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                {/* Account Info Card */}
                <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                    <h3>Minha Conta</h3>
                    <div style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        <p><strong>Nome:</strong> {user?.first_name} {user?.last_name}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Usuário:</strong> @{user?.username}</p>
                    </div>
                </div>

                {/* Default Address Card */}
                <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Endereço Padrão</h3>
                        <a href="#/profile/addresses" style={{ fontSize: '0.875rem' }}>Gerenciar</a>
                    </div>
                    {defaultAddress ? (
                        <div style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                            <p><strong>{defaultAddress.label}</strong></p>
                            <p>{defaultAddress.street}</p>
                            <p>{defaultAddress.city}, {defaultAddress.state}</p>
                            <p>{defaultAddress.zip_code}</p>
                        </div>
                    ) : (
                        <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            <MapPin size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                            <p>Nenhum endereço cadastrado</p>
                            <a href="#/profile/addresses" className="btn btn-sm btn-outline" style={{ marginTop: '0.5rem' }}>Adicionar</a>
                        </div>
                    )}
                </div>

                {/* Recent Orders Card */}
                <div className="card" style={{ gridColumn: '1 / -1', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Pedidos Recentes</h3>
                        <a href="#/orders" style={{ fontSize: '0.875rem' }}>Ver Todos</a>
                    </div>

                    {!orders || orders.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <Package size={32} style={{ opacity: 0.5 }} />
                            <p>Você ainda não fez nenhum pedido.</p>
                        </div>
                    ) : (
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.slice(0, 3).map(order => (
                                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <strong>#{order.orderNumber}</strong>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} itens
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold' }}>R$ {order.totals.total.toFixed(2)}</div>
                                        <span className={`status-badge ${order.status}`} style={{ fontSize: '0.75rem' }}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </UserProfileLayout>
    );
}

export default ProfileOverview;
