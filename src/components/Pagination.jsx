import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 7; // Número máximo de páginas visíveis

        if (totalPages <= maxVisible) {
            // Mostrar todas as páginas se forem poucas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Lógica para mostrar páginas com ellipsis
            if (currentPage <= 4) {
                // Início: 1 2 3 4 5 ... 10
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // Fim: 1 ... 6 7 8 9 10
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                // Meio: 1 ... 4 5 6 ... 10
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const handlePageClick = (page) => {
        if (page !== '...' && page !== currentPage) {
            onPageChange(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button
                className="pagination-btn"
                onClick={() => handlePageClick(1)}
                disabled={currentPage === 1}
                title="Primeira página"
            >
                <ChevronsLeft size={18} />
            </button>

            <button
                className="pagination-btn"
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
                title="Página anterior"
            >
                <ChevronLeft size={18} />
            </button>

            <div className="pagination-numbers">
                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                            onClick={() => handlePageClick(page)}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            <button
                className="pagination-btn"
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Próxima página"
            >
                <ChevronRight size={18} />
            </button>

            <button
                className="pagination-btn"
                onClick={() => handlePageClick(totalPages)}
                disabled={currentPage === totalPages}
                title="Última página"
            >
                <ChevronsRight size={18} />
            </button>

            <div className="pagination-info">
                Página {currentPage} de {totalPages}
            </div>
        </div>
    );
};

export default Pagination;
