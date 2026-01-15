import React from 'react';
import { ArrowRight } from 'lucide-react';
import cardImage from '../assets/card-fullfoil.png';
import './Hero.css';

const Hero = () => {
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
                        <button className="btn btn-primary">
                            Comprar Agora <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </button>
                        <button className="btn btn-ghost">Vender Suas Cartas</button>
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
