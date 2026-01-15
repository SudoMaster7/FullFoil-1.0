import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './FilterSection.css';

const FilterSection = ({ title, children, defaultExpanded = true }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="filter-section">
            <button
                className="filter-section-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3>{title}</h3>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {isExpanded && (
                <div className="filter-section-content">
                    {children}
                </div>
            )}
        </div>
    );
};

export default FilterSection;
