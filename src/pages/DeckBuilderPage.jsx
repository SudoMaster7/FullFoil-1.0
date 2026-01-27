import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Plus, Save } from 'lucide-react';
import deckBuilderService from '../services/deckBuilderService';
import { searchProducts } from '../services/catalogService';
import { toast } from 'react-hot-toast';

function DeckBuilderPage() {
    // Extract ID from hash: #/builder/123
    const deckId = window.location.hash.split('/builder/')[1];

    const [deck, setDeck] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        loadDeck();
    }, [deckId]);

    const loadDeck = async () => {
        try {
            const data = await deckBuilderService.getDeck(deckId);
            setDeck(data);
        } catch (error) {
            toast.error('Erro ao carregar deck');
            window.location.hash = '#/decks'; // Fallback
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            // Reusing catalog search, filtering by name
            const results = await searchProducts({ search: searchQuery });
            setSearchResults(results.results || results);
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    const handleAddCard = async (product) => {
        try {
            await deckBuilderService.addCardToDeck(deck.id, {
                product_id: product.id,
                quantity: 1,
                is_sideboard: false
            });
            toast.success('Carta adicionada!');
            loadDeck(); // Reload to see changes
        } catch (error) {
            toast.error('Erro ao adicionar carta');
        }
    };

    const handleRemoveCard = async (cardId) => {
        try {
            await deckBuilderService.removeCardFromDeck(deck.id, cardId);
            toast.success('Carta removida');
            loadDeck();
        } catch (error) {
            toast.error('Erro ao remover carta');
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando deck...</div>;
    if (!deck) return null;

    return (
        <div className="container mx-auto p-4 md:p-6" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => window.location.hash = '#/decks'} className="btn-icon">
                        <ArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">{deck.name}</h1>
                        <span className="text-sm text-gray-500">{deck.format} • {deck.cards?.reduce((acc, c) => acc + c.quantity, 0)} cartas</span>
                    </div>
                </div>
                <button className="btn btn-primary flex items-center gap-2">
                    <Save size={18} /> Salvar (Auto)
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                {/* Left: Deck List */}
                <div className="md:col-span-2 overflow-y-auto pr-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {deck.cards?.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                Seu deck está vazio. Pesquise cartas ao lado para adicionar.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-sm text-gray-600">
                                    <tr>
                                        <th className="p-3">Qtd</th>
                                        <th className="p-3">Carta</th>
                                        <th className="p-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deck.cards.map(item => (
                                        <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 font-bold">{item.quantity}</td>
                                            <td className="p-3 flex items-center gap-3">
                                                {item.product.image_url && (
                                                    <img src={item.product.image_url} alt="" className="w-8 h-11 object-cover rounded shadow-sm" />
                                                )}
                                                <div>
                                                    <div className="font-medium">{item.product.name}</div>
                                                    <div className="text-xs text-gray-400">{item.product.set_name}</div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => handleRemoveCard(item.id)}
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right: Card Search */}
                <div className="bg-gray-50 p-4 rounded-lg flex flex-col h-full border border-gray-200">
                    <h3 className="font-bold mb-3">Adicionar Cartas</h3>
                    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            className="flex-1 p-2 border rounded text-sm"
                            placeholder="Nome da carta..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="btn btn-secondary btn-sm">Buscar</button>
                    </form>

                    <div className="flex-1 overflow-y-auto space-y-2">
                        {searching ? (
                            <div className="text-center p-4 text-sm text-gray-500">Buscando...</div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map(card => (
                                <div key={card.id} className="bg-white p-2 rounded border border-gray-200 flex gap-2 group hover:border-primary transition-colors cursor-pointer" onClick={() => handleAddCard(card)}>
                                    <div className="relative">
                                        <img src={card.image_url} alt={card.name} className="w-12 h-16 object-cover rounded bg-gray-200" />
                                        <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex rounded text-white font-bold">
                                            <Plus size={20} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate">{card.name}</div>
                                        <div className="text-xs text-gray-500">{card.set_name} • R$ {card.market_price || '0.00'}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-4 text-sm text-gray-400">
                                Digite o nome da carta para buscar
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeckBuilderPage;
