import React from 'react';
import { User, MapPin, Settings, LogOut, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.css';

function UserProfileLayout({ children, activePage }) {
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.hash = '#/login';
    };

    const navItems = [
        { id: 'overview', label: 'Visão Geral', icon: User, href: '#/profile' },
        { id: 'orders', label: 'Meus Pedidos', icon: Package, href: '#/orders' },
        { id: 'addresses', label: 'Endereços', icon: MapPin, href: '#/profile/addresses' },
        { id: 'settings', label: 'Configurações', icon: Settings, href: '#/profile/settings' },
    ];

    return (
        <div className="profile-container">
            <aside className="profile-sidebar">
                <div className="profile-user-info" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="user-avatar large" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{user?.first_name} {user?.last_name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>@{user?.username}</div>
                    </div>
                </div>

                <nav className="profile-nav">
                    {navItems.map(item => (
                        <a
                            key={item.id}
                            href={item.href}
                            className={`profile-nav-item ${activePage === item.id ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </a>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="profile-nav-item"
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginTop: '1rem', color: '#ef4444' }}
                    >
                        <LogOut size={20} />
                        Sair
                    </button>
                </nav>
            </aside>

            <div className="profile-content">
                {children}
            </div>
        </div>
    );
}

export default UserProfileLayout;
