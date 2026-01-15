import React, { useState } from 'react';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import { GAMES } from '../data/games';
import './MobileSidebar.css';

const MobileSidebar = ({ isOpen, onClose }) => {
    const [expandedGame, setExpandedGame] = useState(null);

    const toggleGame = (gameId) => {
        setExpandedGame(expandedGame === gameId ? null : gameId);
    };

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
            <div className={`mobile-sidebar ${isOpen ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <h2>Categorias</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="sidebar-content">
                    {GAMES.map(game => (
                        <div key={game.id} className="sidebar-game">
                            <button
                                className="sidebar-game-header"
                                onClick={() => toggleGame(game.id)}
                            >
                                <div className="game-info">
                                    <span className="game-icon" style={{ color: game.color }}>{game.icon}</span>
                                    <span className="game-name">{game.name}</span>
                                </div>
                                {expandedGame === game.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>

                            {expandedGame === game.id && (
                                <div className="sidebar-game-content">
                                    <div className="sidebar-section">
                                        <h4>Últimas Expansões</h4>
                                        <ul>
                                            {game.sets.map((set, idx) => (
                                                <li key={idx}>
                                                    <a href={`#/${game.id}/set/${set.name}`} onClick={onClose}>
                                                        {set.name}
                                                        {set.featured && <span className="new-badge">Novo</span>}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="sidebar-section">
                                        <h4>Navegar</h4>
                                        <ul>
                                            <li><a href={`#/${game.id}/singles`} onClick={onClose}>Cartas Avulsas</a></li>
                                            <li><a href={`#/${game.id}/sealed`} onClick={onClose}>Produtos Lacrados</a></li>
                                            <li><a href={`#/${game.id}/accessories`} onClick={onClose}>Acessórios</a></li>
                                        </ul>
                                    </div>

                                    <a
                                        href={`#/${game.id}`}
                                        className="btn btn-primary sidebar-cta"
                                        style={{ backgroundColor: game.color }}
                                        onClick={onClose}
                                    >
                                        Ver Tudo de {game.shortName}
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default MobileSidebar;
