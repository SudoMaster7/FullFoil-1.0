import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, TrendingUp, TrendingDown, Bell } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { getCardProduct, getCardHistory } from '../services/catalogService';
import CardViewer3D from '../components/CardViewer3D';
import PriceHistoryChart from '../components/PriceHistoryChart';
import CardInfo from '../components/CardInfo';
import MarketplaceListings from '../components/MarketplaceListings';
import PriceAlertModal from '../components/PriceAlertModal';
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
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAlertModal, setShowAlertModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch in parallel
                const [cardData, historyResponse] = await Promise.all([
                    getCardProduct(cardId),
                    getCardHistory(cardId).catch(err => {
                        console.warn("Failed to load history", err);
                        return []; // Graceful fail
                    })
                ]);

                setCard(cardData);
                // historyResponse might be array or { results: ... } depending on Django
                // My serializer returns List directly.
                setHistory(Array.isArray(historyResponse) ? historyResponse : []);
            } catch (error) {
                console.error("Failed to load card details", error);
            } finally {
                setLoading(false);
            }
        };

        if (cardId) {
            loadData();
        }
    }, [cardId]);

    const handleAddToCart = () => {
        if (card) {
            addToCart({
                ...card,
                price: parseFloat(card.market_price) || parseFloat(card.low_price) || 0
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

    const currentPrice = parseFloat(card.market_price) || 0;
    const lowPrice = parseFloat(card.low_price) || 0;
    const highPrice = parseFloat(card.high_price) || 0;

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
                    <span>{card.game ? card.game.toUpperCase() : 'TCG'}</span>
                    <span className="breadcrumb-separator">/</span>
                    <span>{card.set_name || card.card_set?.name}</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{card.name}</span>
                </div>

                {/* Main Content Grid */}
                <div className="card-detail-grid">
                    {/* Left Column - Card Viewer */}
                    <div className="card-viewer-section">
                        <CardViewer3D card={{ ...card, image: card.image_url }} />

                        <div className="quick-actions">
                            <button
                                className="btn btn-primary btn-block"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart size={20} />
                                Adicionar ao Carrinho - R$ {currentPrice.toFixed(2)}
                            </button>
                            <button
                                className="btn btn-outline btn-block"
                                onClick={() => setShowAlertModal(true)}
                                style={{ marginTop: '0.5rem' }}
                            >
                                <Bell size={20} />
                                Criar Alerta de Preço
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Card Info & Stats */}
                    <div className="card-info-section">
                        <div className="card-header">
                            <div>
                                <h1 className="card-title">{card.name}</h1>
                                <div className="card-meta">
                                    <span className="card-set">{card.set_name || card.card_set?.name}</span>
                                    <span className="card-number">#{card.number}</span>
                                    <span className={`card-rarity ${card.rarity?.toLowerCase()}`}>
                                        {card.rarity}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Price Stats */}
                        <div className="price-stats-grid">
                            <div className="price-stat-card">
                                <div className="stat-label">Preço de Mercado</div>
                                <div className="stat-value primary">
                                    R$ {currentPrice.toFixed(2)}
                                </div>
                                <div className="stat-trend neutral">
                                    <TrendingUp size={16} />
                                    Baseado em vendas recentes
                                </div>
                            </div>
                            <div className="price-stat-card">
                                <div className="stat-label">Mínimo</div>
                                <div className="stat-value">R$ {lowPrice.toFixed(2)}</div>
                            </div>
                            <div className="price-stat-card">
                                <div className="stat-label">Máximo</div>
                                <div className="stat-value">R$ {highPrice.toFixed(2)}</div>
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
                    </div>
                    <PriceHistoryChart data={history} />
                </div>

                {/* Marketplace Listings */}
                <div className="marketplace-section">
                    <h2>Anúncios Disponíveis</h2>
                    <MarketplaceListings cardId={card.id} currentPrice={currentPrice} />
                </div>
            </div>

            {showAlertModal && (
                <PriceAlertModal
                    product={card}
                    onClose={() => setShowAlertModal(false)}
                />
            )}
        </div>
    );
};

export default CardDetailPage;
