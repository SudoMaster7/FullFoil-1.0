import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './UserMenu.css';

function UserMenu() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="user-menu" ref={menuRef}>
            <button
                className="user-menu-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menu do usuário"
            >
                <div className="user-avatar">
                    {getInitials(user.name)}
                </div>
                <span className="user-name">{user.name.split(' ')[0]}</span>
            </button>

            {isOpen && (
                <div className="user-menu-dropdown">
                    <div className="user-menu-header">
                        <div className="user-avatar large">
                            {getInitials(user.name)}
                        </div>
                        <div className="user-info">
                            <div className="user-full-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                        </div>
                    </div>

                    <div className="user-menu-divider"></div>

                    <div className="user-menu-items">
                        <a
                            href="#/orders"
                            className="user-menu-item"
                            onClick={() => setIsOpen(false)}
                        >
                            <Package size={18} />
                            <span>Meus Pedidos</span>
                        </a>

                        <button
                            className="user-menu-item"
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                            }}
                        >
                            <LogOut size={18} />
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserMenu;
