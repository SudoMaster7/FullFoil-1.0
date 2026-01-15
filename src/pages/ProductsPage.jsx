import React, { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import FilterTags from '../components/FilterTags';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import CardSkeleton from '../components/CardSkeleton';
import SortDropdown from '../components/SortDropdown';
import Pagination from '../components/Pagination';
import { useFilters } from '../contexts/FilterContext';
import './ProductsPage.css';

const ProductsPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 968);

    const {
        filteredProducts,
        filters,
        toggleFilter,
        clearFilter,
        clearFilters,
        loading,
        error,
        fetchCards,
        currentPage,
        goToPage,
        getTotalPages,
        sortBy,
        setSortBy
    } = useFilters();

    const totalPages = getTotalPages();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 968;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleRemoveTag = (category, value) => {
        if (value) {
            toggleFilter(category, value);
        } else {
            clearFilter(category);
        }
    };

    return (
        <div className="products-page">
            {/* Mobile Filter Toggle Button */}
            {isMobile && (
                <button
                    className="mobile-filter-toggle btn btn-primary"
                    onClick={() => setSidebarOpen(true)}
                >
                    <SlidersHorizontal size={18} />
                    Filtros
                </button>
            )}

            <div className="products-container">
                <FilterSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isMobile={isMobile}
                />

                <div className="products-content">
                    <div className="container">
                        <div className="products-header">
                            <FilterTags
                                filters={filters}
                                onRemove={handleRemoveTag}
                                onClearAll={clearFilters}
                                resultCount={filteredProducts.length}
                            />
                            <SortDropdown value={sortBy} onChange={setSortBy} />
                        </div>

                        {error ? (
                            <div className="error-state">
                                <p>{error}</p>
                                <button className="btn btn-primary" onClick={() => fetchCards()}>
                                    Tentar Novamente
                                </button>
                            </div>
                        ) : loading && filteredProducts.length === 0 ? (
                            <div className="grid-layout">
                                {Array(12).fill(0).map((_, i) => (
                                    <CardSkeleton key={i} />
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <>
                                <div className="grid-layout">
                                    {filteredProducts.map(product => (
                                        <Card key={product.id} card={product} />
                                    ))}
                                </div>

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={goToPage}
                                />
                            </>
                        ) : (
                            <div className="no-results">
                                <p>Nenhum produto encontrado com os filtros selecionados.</p>
                                <button className="btn btn-primary" onClick={clearFilters}>
                                    Limpar Filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
