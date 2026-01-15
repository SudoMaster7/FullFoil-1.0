import React from 'react';
import { Check, X } from 'lucide-react';
import './CardInfo.css';

const CardInfo = ({ card }) => {
    const getLegalityIcon = (status) => {
        switch (status) {
            case 'legal':
                return <Check size={16} className="legal-icon legal" />;
            case 'banned':
            case 'restricted':
                return <X size={16} className="legal-icon banned" />;
            default:
                return null;
        }
    };

    const getLegalityText = (status) => {
        const texts = {
            'legal': 'Legal',
            'banned': 'Banida',
            'restricted': 'Restrita',
            'not_legal': 'Não Legal'
        };
        return texts[status] || status;
    };

    return (
        <div className="card-info">
            <div className="info-section">
                <h3 className="info-title">Detalhes da Carta</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Tipo:</span>
                        <span className="info-value">{card.type}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Artista:</span>
                        <span className="info-value">{card.artist}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Set:</span>
                        <span className="info-value">{card.set} ({card.setCode})</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Número:</span>
                        <span className="info-value">#{card.number}</span>
                    </div>
                </div>
            </div>

            {card.description && (
                <div className="info-section">
                    <h3 className="info-title">Descrição</h3>
                    <div className="card-text">
                        {card.description}
                    </div>
                </div>
            )}

            {card.flavorText && (
                <div className="info-section">
                    <div className="flavor-text">
                        <em>{card.flavorText}</em>
                    </div>
                </div>
            )}

            {card.legality && (
                <div className="info-section">
                    <h3 className="info-title">Legalidade</h3>
                    <div className="legality-grid">
                        {Object.entries(card.legality).map(([format, status]) => (
                            <div key={format} className="legality-item">
                                <span className="format-name">{format}</span>
                                <span className={`legality-status ${status}`}>
                                    {getLegalityIcon(status)}
                                    {getLegalityText(status)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CardInfo;
