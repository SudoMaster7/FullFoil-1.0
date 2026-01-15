import React, { useState } from 'react';
import { ArrowUpDown, Check } from 'lucide-react';
import './SortDropdown.css';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Mais Recentes' },
    { value: 'price-asc', label: 'Preço: Menor → Maior' },
    { value: 'price-desc', label: 'Preço: Maior → Menor' },
    { value: 'name-asc', label: 'Nome: A-Z' },
    { value: 'name-desc', label: 'Nome: Z-A' },
    { value: 'rarity-asc', label: 'Raridade: Comum → Mythic' },
    { value: 'rarity-desc', label: 'Raridade: Mythic → Comum' },
];

const SortDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const currentOption = SORT_OPTIONS.find(opt => opt.value === value);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="sort-dropdown">
            <button
                className="sort-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <ArrowUpDown size={16} />
                <span>Ordenar: {currentOption?.label || 'Selecione'}</span>
            </button>

            {isOpen && (
                <>
                    <div className="sort-overlay" onClick={() => setIsOpen(false)} />
                    <div className="sort-menu">
                        {SORT_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                className={`sort-option ${value === option.value ? 'active' : ''}`}
                                onClick={() => handleSelect(option.value)}
                            >
                                <span>{option.label}</span>
                                {value === option.value && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SortDropdown;
