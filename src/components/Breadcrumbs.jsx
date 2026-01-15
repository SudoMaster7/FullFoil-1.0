import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumbs.css';

const Breadcrumbs = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
                <li>
                    <a href="/">
                        <Home size={14} />
                        <span>Início</span>
                    </a>
                </li>
                {items.map((item, index) => (
                    <li key={index}>
                        <ChevronRight size={14} className="separator" />
                        {item.href && index < items.length - 1 ? (
                            <a href={item.href}>{item.label}</a>
                        ) : (
                            <span className="current">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
