import React, { useEffect, useState } from 'react';
import Card from './Card';
import CardSkeleton from './CardSkeleton';
import { useFilters } from '../contexts/FilterContext';
import scryfallService from '../services/scryfallService';
import './CardGrid.css';

const CardGrid = ({ title }) => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const { activeGame } = useFilters();

    useEffect(() => {
        fetchFeaturedCards();
    }, [activeGame]);

    const fetchFeaturedCards = async () => {
        setLoading(true);
        try {
            // Get random cards from Scryfall
            const result = await scryfallService.getRandomCards(5);
            setCards(result.cards);
        } catch (error) {
            console.error('Error fetching featured cards:', error);
            setCards([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="card-grid-section">
            <div className="container">
                <div className="section-header">
                    <h2>{title}</h2>
                    <a href="#" className="view-all">Ver Tudo</a>
                </div>
                <div className="grid-layout">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <CardSkeleton key={i} />
                        ))
                    ) : (
                        cards.map(card => (
                            <Card key={card.id} card={card} />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default CardGrid;
