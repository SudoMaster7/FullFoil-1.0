import React from 'react';
import './CardSkeleton.css';

const CardSkeleton = () => {
    return (
        <div className="card-skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-text"></div>
                <div className="skeleton-price"></div>
            </div>
        </div>
    );
};

export default CardSkeleton;
