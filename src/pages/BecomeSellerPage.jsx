import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createSeller } from '../services/sellerService';
import toast from 'react-hot-toast';
import './BecomeSellerPage.css';

function BecomeSellerPage() {
    const { user, token, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        description: '',
        zipCode: '',
        street: '',
        city: '',
        state: ''
    });

    if (!isAuthenticated) {
        return (
            <div className="become-seller-page">
                <div className="auth-required">
                    <h2>Login Necessário</h2>
                    <p>Você precisa estar logado para se tornar um vendedor.</p>
                    <a href="#/login" className="btn btn-primary">Fazer Login</a>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const sellerData = {
                businessName: formData.businessName,
                description: formData.description,
                address: {
                    zipCode: formData.zipCode,
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    country: 'Brasil'
                }
            };

            await createSeller(sellerData, token);
            toast.success('Conta de vendedor criada com sucesso!');
            window.location.hash = '#/seller/dashboard';
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="become-seller-page">
            <div className="become-seller-container">
                <div className="become-seller-header">
                    <h1>🏪 Torne-se um Vendedor</h1>
                    <p>Comece a vender suas cartas no FullFoil Marketplace</p>
                </div>

                <div className="benefits-section">
                    <h2>Por que vender no FullFoil?</h2>
                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <span className="benefit-icon">💰</span>
                            <h3>Ganhe Dinheiro</h3>
                            <p>Venda suas cartas duplicadas ou coleção</p>
                        </div>
                        <div className="benefit-card">
                            <span className="benefit-icon">🎯</span>
                            <h3>Alcance Compradores</h3>
                            <p>Milhares de jogadores procurando cartas</p>
                        </div>
                        <div className="benefit-card">
                            <span className="benefit-icon">✨</span>
                            <h3>Fácil de Usar</h3>
                            <p>Dashboard simples para gerenciar vendas</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="seller-form">
                    <h2>Informações do Negócio</h2>

                    <div className="form-group">
                        <label htmlFor="businessName">Nome do Negócio *</label>
                        <input
                            id="businessName"
                            name="businessName"
                            type="text"
                            value={formData.businessName}
                            onChange={handleChange}
                            required
                            minLength={3}
                            placeholder="Ex: Cards Shop SP"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Descrição</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Conte um pouco sobre sua loja..."
                        />
                    </div>

                    <h2>Endereço</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="zipCode">CEP *</label>
                            <input
                                id="zipCode"
                                name="zipCode"
                                type="text"
                                value={formData.zipCode}
                                onChange={handleChange}
                                required
                                placeholder="12345-678"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="city">Cidade *</label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                placeholder="São Paulo"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="state">Estado *</label>
                            <input
                                id="state"
                                name="state"
                                type="text"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                maxLength={2}
                                placeholder="SP"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="street">Endereço Completo *</label>
                        <input
                            id="street"
                            name="street"
                            type="text"
                            value={formData.street}
                            onChange={handleChange}
                            required
                            placeholder="Rua, Número, Complemento"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Criando conta...' : 'Criar Conta de Vendedor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BecomeSellerPage;
