import React, { useEffect } from 'react';
import ProductsPage from './ProductsPage';
import Breadcrumbs from '../components/Breadcrumbs';
import { useFilters } from '../contexts/FilterContext';

const GAME_CONFIG = {
    magic: { name: 'Magic: The Gathering', icon: '🔮', color: '#ff6b35' },
    pokemon: { name: 'Pokémon TCG', icon: '⚡', color: '#ffca3a' },
    yugioh: { name: 'Yu-Gi-Oh!', icon: '🎴', color: '#8ac926' },
    lorcana: { name: 'Disney Lorcana', icon: '✨', color: '#3b82f6' },
    onepiece: { name: 'One Piece Card Game', icon: '🏴‍☠️', color: '#ef4444' }
};

const CatalogPage = ({ gameType }) => {
    const gameConfig = GAME_CONFIG[gameType];
    const { setActiveGame } = useFilters();

    useEffect(() => {
        // Set active game when component mounts or gameType changes
        if (gameType) {
            setActiveGame(gameType);
        }
    }, [gameType, setActiveGame]);

    if (!gameConfig) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <h1>Jogo não encontrado</h1>
                <a href="#/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Voltar para Home
                </a>
            </div>
        );
    }

    const breadcrumbs = [
        { label: 'Home', href: '#/' },
        { label: gameConfig.name, href: `#/${gameType}` }
    ];

    return (
        <>
            <div className="container">
                <Breadcrumbs items={breadcrumbs} />
                <div style={{
                    marginTop: '1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <span style={{ fontSize: '2rem' }}>{gameConfig.icon}</span>
                    <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>
                        {gameConfig.name}
                    </h1>
                </div>
            </div>
            <ProductsPage />
        </>
    );
};

export default CatalogPage;
