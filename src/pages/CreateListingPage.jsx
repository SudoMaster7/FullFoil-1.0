import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMySeller } from '../services/sellerService';
import { createListing } from '../services/listingService';
import toast from 'react-hot-toast';
import './CreateListingPage.css';

function CreateListingPage() {
    const { user, token, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [seller, setSeller] = useState(null);
    const [formData, setFormData] = useState({
        cardId: '',
        cardName: '',
        game: 'magic',
        set: '',
        rarity: '',
        imageUrl: '',
        price: '',
        quantity: '1',
        condition: 'near_mint',
        language: 'en',
        foil: false
    });

    React.useEffect(() => {
        if (isAuthenticated && token) {
            loadSeller();
        }
    }, [isAuthenticated, token]);

    const loadSeller = async () => {
        try {
            const sellerData = await getMySeller(token);
            if (!sellerData) {
                toast.error('Você precisa ser um vendedor');
                window.location.hash = '#/become-seller';
                return;
            }
            setSeller(sellerData);
        } catch (error) {
            toast.error('Erro ao carregar dados do vendedor');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="create-listing-page">
                <div className="auth-required">
                    <h2>Login Necessário</h2>
                    <p>Você precisa estar logado para criar listings.</p>
                    <a href="#/login" className="btn btn-primary">Fazer Login</a>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const listingData = {
                cardId: formData.cardId || `${formData.game}_${Date.now()}`,
                cardData: {
                    name: formData.cardName,
                    game: formData.game,
                    set: formData.set,
                    rarity: formData.rarity,
                    imageUrl: formData.imageUrl
                },
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                condition: formData.condition,
                language: formData.language,
                foil: formData.foil
            };

            await createListing(listingData, token);
            toast.success('Listing criado com sucesso!');

            // Reset form
            setFormData({
                cardId: '',
                cardName: '',
                game: 'magic',
                set: '',
                rarity: '',
                imageUrl: '',
                price: '',
                quantity: '1',
                condition: 'near_mint',
                language: 'en',
                foil: false
            });
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-listing-page">
            <div className="create-listing-container">
                <div className="page-header">
                    <h1>📦 Criar Novo Listing</h1>
                    <p>Adicione uma carta ao seu inventário</p>
                </div>

                <form onSubmit={handleSubmit} className="listing-form">
                    <div className="form-section">
                        <h2>Informações da Carta</h2>

                        <div className="form-group">
                            <label htmlFor="cardName">Nome da Carta *</label>
                            <input
                                id="cardName"
                                name="cardName"
                                type="text"
                                value={formData.cardName}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Black Lotus"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="game">Jogo *</label>
                                <select
                                    id="game"
                                    name="game"
                                    value={formData.game}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="magic">Magic: The Gathering</option>
                                    <option value="pokemon">Pokémon TCG</option>
                                    <option value="yugioh">Yu-Gi-Oh!</option>
                                    <option value="lorcana">Disney Lorcana</option>
                                    <option value="onepiece">One Piece</option>
                                    <option value="fab">Flesh and Blood</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="set">Expansão</label>
                                <input
                                    id="set"
                                    name="set"
                                    type="text"
                                    value={formData.set}
                                    onChange={handleChange}
                                    placeholder="Ex: Alpha"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="rarity">Raridade</label>
                                <input
                                    id="rarity"
                                    name="rarity"
                                    type="text"
                                    value={formData.rarity}
                                    onChange={handleChange}
                                    placeholder="Ex: Mythic Rare"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="imageUrl">URL da Imagem</label>
                            <input
                                id="imageUrl"
                                name="imageUrl"
                                type="url"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Detalhes do Produto</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="price">Preço (R$) *</label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="quantity">Quantidade *</label>
                                <input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="condition">Condição *</label>
                                <select
                                    id="condition"
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="near_mint">Near Mint</option>
                                    <option value="lightly_played">Lightly Played</option>
                                    <option value="moderately_played">Moderately Played</option>
                                    <option value="heavily_played">Heavily Played</option>
                                    <option value="damaged">Damaged</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="language">Idioma *</label>
                                <select
                                    id="language"
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="en">English</option>
                                    <option value="pt">Português</option>
                                    <option value="es">Español</option>
                                    <option value="ja">日本語</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="foil"
                                    checked={formData.foil}
                                    onChange={handleChange}
                                />
                                <span>Foil / Holográfica</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Listing'}
                        </button>
                        <a href="#/seller/dashboard" className="btn btn-secondary">
                            Cancelar
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateListingPage;
