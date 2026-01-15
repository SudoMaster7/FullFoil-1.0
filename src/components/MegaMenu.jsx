import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GAMES } from '../data/games';
import './MegaMenu.css';

const MegaMenu = ({ activeRoute = null }) => {
    const [hoveredGame, setHoveredGame] = useState(null);

    return (
        <div className="mega-menu">
            <div className="mega-menu-trigger-wrapper">
                {GAMES.map(game => (
                    <div
                        key={game.id}
                        className={`mega-menu-item ${activeRoute === game.id ? 'active' : ''}`}
                        onMouseEnter={() => setHoveredGame(game.id)}
                        onMouseLeave={() => setHoveredGame(null)}
                    >
                        <button className="mega-menu-trigger">
                            <span className="game-icon">{game.icon}</span>
                            <span>{game.shortName}</span>
                            <ChevronDown size={14} />
                        </button>

                        {hoveredGame === game.id && (
                            <div className="mega-menu-dropdown">
                                <div className="mega-menu-content">
                                    <div className="mega-menu-section">
                                        <h3>Comprar por Expansão</h3>
                                        <ul>
                                            {game.sets.map((set, idx) => (
                                                <li key={idx}>
                                                    <a href={`#/${game.id}/set/${set.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                                        {set.name}
                                                        {set.featured && <span className="featured-badge">Novo</span>}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mega-menu-section">
                                        <h3>Links Rápidos</h3>
                                        <ul>
                                            <li><a href={`#/${game.id}/singles`}>Cartas Avulsas</a></li>
                                            <li><a href={`#/${game.id}/sealed`}>Produtos Lacrados</a></li>
                                            <li><a href={`#/${game.id}/accessories`}>Acessórios</a></li>
                                            <li><a href={`#/${game.id}`} className="view-all-link">Ver Tudo →</a></li>
                                        </ul>
                                    </div>

                                    <div className="mega-menu-featured">
                                        <div className="featured-card" style={{ borderColor: game.color }}>
                                            <div className="featured-icon" style={{ color: game.color }}>{game.icon}</div>
                                            <h4>{game.name}</h4>
                                            <p>Explore as últimas expansões e melhores ofertas</p>
                                            <a href={`#/${game.id}`} className="btn btn-primary" style={{ backgroundColor: game.color }}>
                                                Comprar Agora
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MegaMenu;
