import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import './CardViewer3D.css';

const CardViewer3D = ({ card }) => {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleMouseMove = (e) => {
        if (isZoomed) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateY = ((x - centerX) / centerX) * 15;
        const rotateX = ((centerY - y) / centerY) * 15;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        if (!isZoomed) {
            setRotation({ x: 0, y: 0 });
        }
    };

    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
        if (isZoomed) {
            setRotation({ x: 0, y: 0 });
        }
    };

    const toggleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="card-viewer-3d">
            <div
                className={`card-container ${isZoomed ? 'zoomed' : ''} ${isFlipped ? 'flipped' : ''}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    className="card-3d"
                    style={{
                        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`
                    }}
                >
                    <div className="card-face card-front">
                        <img
                            src={card.imageHires || card.image}
                            alt={card.name}
                            className="card-image"
                        />
                        <div className="card-shine"></div>
                        <div className="card-glare"></div>
                    </div>
                    {/* Verso (se houver) */}
                    <div className="card-face card-back">
                        <div className="card-back-placeholder">
                            <span>{card.game.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="viewer-controls">
                <button
                    className="viewer-btn"
                    onClick={toggleZoom}
                    title={isZoomed ? "Diminuir zoom" : "Aumentar zoom"}
                >
                    {isZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
                </button>
                <button
                    className="viewer-btn"
                    onClick={toggleFlip}
                    title="Virar carta"
                >
                    <RotateCw size={18} />
                </button>
            </div>

            <div className="viewer-hint">
                Passe o mouse para girar a carta
            </div>
        </div>
    );
};

export default CardViewer3D;
