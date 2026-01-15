import React from 'react';
import { Search, User, Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import CartButton from './CartButton';
import './Navbar.css';

const Navbar = ({ onMenuClick }) => {
    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <div className="navbar-brand">
                    <button className="btn btn-ghost mobile-menu-btn" onClick={onMenuClick}>
                        <Menu size={24} />
                    </button>
                    <a href="#/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                        <span className="logo-icon">✨</span>
                        <span className="logo-text">FullFoil</span>
                    </a>
                </div>

                <div className="navbar-search">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input type="text" placeholder="Buscar cartas, expansões ou jogos..." />
                    </div>
                </div>

                <div className="navbar-actions">
                    <ThemeToggle />
                    <button className="btn btn-ghost icon-btn">
                        <User size={20} />
                    </button>
                    <CartButton />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
