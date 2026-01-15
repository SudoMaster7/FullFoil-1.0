import React, { useState } from 'react';
import './PriceRangeSlider.css';

const PriceRangeSlider = ({ min = 0, max = 10000, value, onChange }) => {
    const [localMin, setLocalMin] = useState(value?.min || min);
    const [localMax, setLocalMax] = useState(value?.max || max);

    const handleMinChange = (e) => {
        const newMin = parseInt(e.target.value);
        if (newMin <= localMax) {
            setLocalMin(newMin);
            onChange?.({ min: newMin, max: localMax });
        }
    };

    const handleMaxChange = (e) => {
        const newMax = parseInt(e.target.value);
        if (newMax >= localMin) {
            setLocalMax(newMax);
            onChange?.({ min: localMin, max: newMax });
        }
    };

    const handleMinInputChange = (e) => {
        const newMin = parseInt(e.target.value) || 0;
        if (newMin <= localMax && newMin >= min) {
            setLocalMin(newMin);
            onChange?.({ min: newMin, max: localMax });
        }
    };

    const handleMaxInputChange = (e) => {
        const newMax = parseInt(e.target.value) || max;
        if (newMax >= localMin && newMax <= max) {
            setLocalMax(newMax);
            onChange?.({ min: localMin, max: newMax });
        }
    };

    return (
        <div className="price-range-slider">
            <div className="price-inputs">
                <div className="price-input-group">
                    <label>Mínimo</label>
                    <input
                        type="number"
                        value={localMin}
                        onChange={handleMinInputChange}
                        min={min}
                        max={localMax}
                    />
                </div>
                <span className="price-separator">-</span>
                <div className="price-input-group">
                    <label>Máximo</label>
                    <input
                        type="number"
                        value={localMax}
                        onChange={handleMaxInputChange}
                        min={localMin}
                        max={max}
                    />
                </div>
            </div>

            <div className="price-slider-container">
                <input
                    type="range"
                    className="price-slider price-slider-min"
                    min={min}
                    max={max}
                    value={localMin}
                    onChange={handleMinChange}
                />
                <input
                    type="range"
                    className="price-slider price-slider-max"
                    min={min}
                    max={max}
                    value={localMax}
                    onChange={handleMaxChange}
                />
                <div className="price-slider-track">
                    <div
                        className="price-slider-range"
                        style={{
                            left: `${((localMin - min) / (max - min)) * 100}%`,
                            width: `${((localMax - localMin) / (max - min)) * 100}%`
                        }}
                    />
                </div>
            </div>

            <div className="price-display">
                <span>R$ {localMin.toFixed(2)}</span>
                <span>R$ {localMax.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default PriceRangeSlider;
