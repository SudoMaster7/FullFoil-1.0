import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMySeller } from '../services/sellerService';
import cardImage from '../assets/card-fullfoil.png';
import './Hero.css';

const Hero = () => {
    const { isAuthenticated, token } = useAuth();
    const [isSeller, setIsSeller] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && token) {
            checkSellerStatus();
        }
    }, [isAuthenticated, token]);

    const checkSellerStatus = async () => {
        try {
            setLoading(true);
            const seller = await getMySeller(token);
            setIsSeller(!!seller);
        } catch (error) {
            setIsSeller(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSellClick = () => {
        if (!isAuthenticated) {
            window.location.hash = '#/login';
            return;
        }

        if (isSeller) {
            window.location.hash = '#/create-listing';
        } else {
            window.location.hash = '#/become-seller';
        }
    };

    const handleBuyClick = () => {
        window.location.hash = '#/marketplace';
    };

    return (
        <section className="hero">
            <div className="container hero-content">
                <div className="hero-text">
                    <span className="hero-badge">Novidades: Lost Caverns of Ixalan</span>
                    <h1 className="hero-title">O Marketplace para <br /><span className="gradient-text">Colecionadores Profissionais</span></h1>
                    <p>
                        Compre, venda e negocie as cartas mais raras de Magic: The Gathering, Pokémon, Yu-Gi-Oh! e muito mais.
                        Autenticidade verificada e proteção premium.
                    </p>
                    <div className="hero-cta">
                        <button
                            className="btn btn-primary"
                            onClick={handleBuyClick}
                        >
                            Comprar Agora <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={handleSellClick}
                            disabled={loading}
                        >
                            {loading ? 'Carregando...' : isSeller ? 'Criar Anúncio' : 'Vender Suas Cartas'}
                        </button>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="card-mockup glow-effect">
                        <div className="mockup-inner">
                            <img src={cardImage} alt="carta de exemplo" />
                        </div>
                    </div>
                    <div className="card-mockup secondary-card">
                        <div className="mockup-inner">
                            <img src="https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=300&h=420&fit=crop" alt="carta de exemplo" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
