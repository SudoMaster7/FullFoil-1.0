import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import CardViewer3D from '../components/CardViewer3D';
import PriceChart from '../components/PriceChart';
import CardInfo from '../components/CardInfo';
import MarketplaceListings from '../components/MarketplaceListings';
import './CardDetailPage.css';

const CardDetailPage = () => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const pathParts = window.location.hash.slice(1).split('/');
    const game = pathParts[1];
    const cardId = pathParts[3];

    const navigate = (path) => {
        window.location.hash = path;
    };

    const { addToCart } = useCart();
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('30d');

    useEffect(() => {
        // Try to get card from sessionStorage first
        const storedCard = sessionStorage.getItem('currentCard');

        if (storedCard) {
            try {
                const cardData = JSON.parse(storedCard);

                // Enhance card data with price history
                const enhancedCard = {
                    ...cardData,
                    imageHires: cardData.image,
                    description: cardData.type || 'Carta de colecionador',
                    flavorText: '',
                    artist: 'Artista Desconhecido',
                    setCode: cardData.set?.substring(0, 3).toUpperCase() || 'XXX',
                    number: cardData.id?.split('-')[1] || '001',
                    prices: {
                        current: cardData.price || 0,
                        min: (cardData.price || 0) * 0.85,
                        avg: (cardData.price || 0) * 0.95,
                        max: (cardData.price || 0) * 1.15,
                        trend: (Math.random() - 0.5) * 10,
                        history: generatePriceHistory(selectedPeriod, cardData.price || 100)
                    },
                    legality: {
                        standard: Math.random() > 0.5 ? 'legal' : 'not_legal',
                        modern: 'legal',
                        legacy: 'legal',
                        vintage: 'legal',
                        commander: 'legal'
                    }
                };

                setCard(enhancedCard);
                setLoading(false);
                return;
            } catch (error) {
                console.error('Error parsing stored card:', error);
            }
        }

        // Fallback to mock data if no stored card
        const mockCard = {
            id: cardId,
            name: 'Carta Exemplo',
            set: 'Set Exemplo',
            setCode: 'EXM',
            number: '001',
            rarity: 'Rare',
            type: 'Carta',
            artist: 'Artista Desconhecido',
            image: 'https://images.pokemontcg.io/base1/4_hires.png',
            imageHires: 'https://images.pokemontcg.io/base1/4_hires.png',
            description: 'Descrição da carta não disponível.',
            flavorText: '',
            game: game,
            condition: 'NM',
            prices: {
                current: 100.00,
                min: 85.00,
                avg: 95.00,
                max: 115.00,
                trend: 2.5,
                history: generatePriceHistory(selectedPeriod, 100)
            },
            legality: {
                standard: 'legal',
                modern: 'legal',
                legacy: 'legal',
                vintage: 'legal',
                commander: 'legal'
            }
        };

        setTimeout(() => {
            setCard(mockCard);
            setLoading(false);
        }, 500);
    }, [cardId, game, selectedPeriod]);

    const generatePriceHistory = (period, basePrice = 100) => {
        const days = period === '30d' ? 30 : period === '90d' ? 90 : 365;
        const history = [];

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const variance = (Math.random() - 0.5) * (basePrice * 0.1);
            const price = basePrice + variance + ((days - i) * (basePrice * 0.002));

            history.push({
                date: date.toLocaleDateString('pt-BR'),
                price: parseFloat(price.toFixed(2))
            });
        }

        return history;
    };

    const handleAddToCart = () => {
        if (card) {
            addToCart({
                ...card,
                price: card.prices.current
            });
        }
    };

    if (loading) {
        return (
            <div className="card-detail-loading">
                <div className="spinner"></div>
                <p>Carregando detalhes...</p>
            </div>
        );
    }

    if (!card) {
        return (
            <div className="card-detail-error">
                <h2>Carta não encontrada</h2>
                <button onClick={() => navigate(-1)} className="btn btn-primary">
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="card-detail-page">
            <div className="container">
                {/* Breadcrumbs */}
                <div className="breadcrumbs">
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <ArrowLeft size={20} />
                        Voltar
                    </button>
                    <span className="breadcrumb-separator">/</span>
                    <span>{game.toUpperCase()}</span>
                    <span className="breadcrumb-separator">/</span>
                    <span>{card.set}</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{card.name}</span>
                </div>

                {/* Main Content Grid */}
                <div className="card-detail-grid">
                    {/* Left Column - Card Viewer */}
                    <div className="card-viewer-section">
                        <CardViewer3D card={card} />

                        <div className="quick-actions">
                            <button
                                className="btn btn-primary btn-block"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart size={20} />
                                Adicionar ao Carrinho - R$ {card.prices.current.toFixed(2)}
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Card Info & Stats */}
                    <div className="card-info-section">
                        <div className="card-header">
                            <div>
                                <h1 className="card-title">{card.name}</h1>
                                <div className="card-meta">
                                    <span className="card-set">{card.set}</span>
                                    <span className="card-number">#{card.number}</span>
                                    <span className={`card-rarity ${card.rarity.toLowerCase()}`}>
                                        {card.rarity}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Price Stats */}
                        <div className="price-stats-grid">
                            <div className="price-stat-card">
                                <div className="stat-label">Preço Atual</div>
                                <div className="stat-value primary">
                                    R$ {card.prices.current.toFixed(2)}
                                </div>
                                <div className={`stat-trend ${card.prices.trend >= 0 ? 'positive' : 'negative'}`}>
                                    {card.prices.trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    {Math.abs(card.prices.trend)}% (30d)
                                </div>
                            </div>
                            <div className="price-stat-card">
                                <div className="stat-label">Mínimo</div>
                                <div className="stat-value">R$ {card.prices.min.toFixed(2)}</div>
                            </div>
                            <div className="price-stat-card">
                                <div className="stat-label">Média</div>
                                <div className="stat-value">R$ {card.prices.avg.toFixed(2)}</div>
                            </div>
                            <div className="price-stat-card">
                                <div className="stat-label">Máximo</div>
                                <div className="stat-value">R$ {card.prices.max.toFixed(2)}</div>
                            </div>
                        </div>

                        {/* Card Information */}
                        <CardInfo card={card} />
                    </div>
                </div>

                {/* Price Chart */}
                <div className="price-chart-section">
                    <div className="section-header">
                        <h2>Histórico de Preços</h2>
                        <div className="period-selector">
                            <button
                                className={`period-btn ${selectedPeriod === '30d' ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod('30d')}
                            >
                                30 Dias
                            </button>
                            <button
                                className={`period-btn ${selectedPeriod === '90d' ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod('90d')}
                            >
                                90 Dias
                            </button>
                            <button
                                className={`period-btn ${selectedPeriod === '1y' ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod('1y')}
                            >
                                1 Ano
                            </button>
                        </div>
                    </div>
                    <PriceChart data={card.prices.history} />
                </div>

                {/* Marketplace Listings */}
                <div className="marketplace-section">
                    <h2>Anúncios Disponíveis</h2>
                    <MarketplaceListings cardId={card.id} currentPrice={card.prices.current} />
                </div>
            </div>
        </div>
    );
};

export default CardDetailPage;
