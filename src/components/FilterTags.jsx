import React from 'react';
import { X } from 'lucide-react';
import './FilterTags.css';

const FilterTags = ({ filters, onRemove, onClearAll, resultCount }) => {
    const getTagLabel = (category, value) => {
        switch (category) {
            case 'condition':
                return `Condição: ${value}`;
            case 'rarity':
                return `Raridade: ${value}`;
            case 'priceRange':
                return `Preço: R$${value.min} - R$${value.max}`;
            case 'colors':
                return `Cor: ${value}`;
            case 'types':
                return `Tipo: ${value}`;
            case 'set':
                return `Set: ${value}`;
            default:
                return value;
        }
    };

    const hasActiveFilters = () => {
        return (
            filters.condition?.length > 0 ||
            filters.rarity?.length > 0 ||
            filters.colors?.length > 0 ||
            filters.types?.length > 0 ||
            filters.set ||
            (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 10000))
        );
    };

    if (!hasActiveFilters()) {
        return (
            <div className="filter-tags-container">
                <div className="result-count">{resultCount} produtos encontrados</div>
            </div>
        );
    }

    return (
        <div className="filter-tags-container">
            <div className="filter-tags">
                {filters.condition?.map(value => (
                    <span key={`condition-${value}`} className="filter-tag">
                        {getTagLabel('condition', value)}
                        <button onClick={() => onRemove('condition', value)}>
                            <X size={14} />
                        </button>
                    </span>
                ))}

                {filters.rarity?.map(value => (
                    <span key={`rarity-${value}`} className="filter-tag">
                        {getTagLabel('rarity', value)}
                        <button onClick={() => onRemove('rarity', value)}>
                            <X size={14} />
                        </button>
                    </span>
                ))}

                {filters.colors?.map(value => (
                    <span key={`color-${value}`} className="filter-tag">
                        {getTagLabel('colors', value)}
                        <button onClick={() => onRemove('colors', value)}>
                            <X size={14} />
                        </button>
                    </span>
                ))}

                {filters.types?.map(value => (
                    <span key={`type-${value}`} className="filter-tag">
                        {getTagLabel('types', value)}
                        <button onClick={() => onRemove('types', value)}>
                            <X size={14} />
                        </button>
                    </span>
                ))}

                {filters.set && (
                    <span className="filter-tag">
                        {getTagLabel('set', filters.set)}
                        <button onClick={() => onRemove('set')}>
                            <X size={14} />
                        </button>
                    </span>
                )}

                {(filters.priceRange?.min > 0 || filters.priceRange?.max < 10000) && (
                    <span className="filter-tag">
                        {getTagLabel('priceRange', filters.priceRange)}
                        <button onClick={() => onRemove('priceRange')}>
                            <X size={14} />
                        </button>
                    </span>
                )}

                <button className="clear-all-btn" onClick={onClearAll}>
                    Limpar Tudo
                </button>
            </div>

            <div className="result-count">{resultCount} produtos encontrados</div>
        </div>
    );
};

export default FilterTags;
