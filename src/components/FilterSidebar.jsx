import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import FilterSection from './FilterSection';
import PriceRangeSlider from './PriceRangeSlider';
import { useFilters } from '../contexts/FilterContext';
import { FILTER_OPTIONS } from '../data/mockProducts';
import './FilterSidebar.css';

const FilterSidebar = ({ isOpen, onClose, isMobile = false }) => {
    const { filters, toggleFilter, setFilter, clearFilters, activeGame } = useFilters();

    const renderCheckbox = (category, option) => (
        <div key={option.value} className="filter-checkbox">
            <input
                type="checkbox"
                id={`${category}-${option.value}`}
                checked={filters[category]?.includes(option.value) || false}
                onChange={() => toggleFilter(category, option.value)}
            />
            <label htmlFor={`${category}-${option.value}`}>{option.label}</label>
        </div>
    );

    const renderColorCheckbox = (color) => (
        <div key={color.value} className="color-checkbox">
            <input
                type="checkbox"
                id={`color-${color.value}`}
                checked={filters.colors?.includes(color.value) || false}
                onChange={() => toggleFilter('colors', color.value)}
            />
            <label
                htmlFor={`color-${color.value}`}
                className="color-label"
            >
                <span
                    className="color-circle"
                    style={{ backgroundColor: color.color }}
                />
                {color.label}
            </label>
        </div>
    );

    return (
        <>
            {isMobile && isOpen && (
                <div className="filter-sidebar-overlay" onClick={onClose} />
            )}

            <aside className={`filter-sidebar ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`}>
                <div className="filter-sidebar-header">
                    <div className="filter-header-title">
                        <SlidersHorizontal size={20} />
                        <h2>Filtros</h2>
                    </div>
                    {isMobile && (
                        <button className="filter-close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    )}
                </div>

                <div className="filter-sidebar-content">
                    {/* Condition Filter */}
                    <FilterSection title="Condição" defaultExpanded={true}>
                        {FILTER_OPTIONS.condition.map(option =>
                            renderCheckbox('condition', option)
                        )}
                    </FilterSection>

                    {/* Rarity Filter */}
                    <FilterSection title="Raridade" defaultExpanded={true}>
                        {FILTER_OPTIONS.rarity[activeGame]?.map(option =>
                            renderCheckbox('rarity', option)
                        ) || FILTER_OPTIONS.rarity.magic.map(option =>
                            renderCheckbox('rarity', option)
                        )}
                    </FilterSection>

                    {/* Price Range Filter */}
                    <FilterSection title="Faixa de Preço" defaultExpanded={true}>
                        <PriceRangeSlider
                            min={0}
                            max={10000}
                            value={filters.priceRange}
                            onChange={(value) => setFilter('priceRange', value)}
                        />
                    </FilterSection>

                    {/* Colors Filter (Magic specific) */}
                    {activeGame === 'magic' && (
                        <FilterSection title="Cores (Magic)" defaultExpanded={false}>
                            {FILTER_OPTIONS.colors.map(renderColorCheckbox)}
                        </FilterSection>
                    )}
                </div>

                <div className="filter-sidebar-footer">
                    <button className="btn btn-ghost" onClick={clearFilters}>
                        Limpar Tudo
                    </button>
                    {isMobile && (
                        <button className="btn btn-primary" onClick={onClose}>
                            Aplicar Filtros
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
};

export default FilterSidebar;
