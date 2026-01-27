import React, { useState, useEffect } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import deckBuilderService from '../services/deckBuilderService';
import { toast } from 'react-hot-toast';

function DeckListPage() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');
    const [newDeckFormat, setNewDeckFormat] = useState('Standard');

    useEffect(() => {
        loadDecks();
    }, []);

    const loadDecks = async () => {
        try {
            const data = await deckBuilderService.getMyDecks();
            setDecks(data.results || data); // Handle pagination standard
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar decks');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDeck = async (e) => {
        e.preventDefault();
        try {
            const newDeck = await deckBuilderService.createDeck({
                name: newDeckName,
                format: newDeckFormat
            });
            toast.success('Deck criado com sucesso!');
            setDecks([newDeck, ...decks]);
            setShowCreateModal(false);
            setNewDeckName('');
            // Navigate to builder? For now just list
            window.location.hash = `#/builder/${newDeck.id}`;
        } catch (error) {
            toast.error('Erro ao criar deck');
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando seus decks...</div>;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BookOpen /> Meus Decks
                </h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={20} /> Novo Deck
                </button>
            </div>

            {decks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                    <h3 className="text-lg font-medium text-gray-500">Você ainda não tem decks</h3>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 text-primary font-bold hover:underline"
                    >
                        Criar meu primeiro deck
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map(deck => (
                        <div key={deck.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                            <h3 className="font-bold text-lg mb-1">{deck.name}</h3>
                            <div className="text-sm text-gray-500 mb-4">{deck.format} • {deck.cards?.length || 0} cartas</div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.location.hash = `#/builder/${deck.id}`}
                                    className="btn btn-outline btn-sm flex-1"
                                >
                                    Editar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Simple Modal for MVP */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Novo Deck</h2>
                        <form onSubmit={handleCreateDeck}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Nome do Deck</label>
                                <input
                                    type="text"
                                    value={newDeckName}
                                    onChange={e => setNewDeckName(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                    placeholder="Ex: Mono Red Aggro"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Formato</label>
                                <select
                                    value={newDeckFormat}
                                    onChange={e => setNewDeckFormat(e.target.value)}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="Standard">Standard</option>
                                    <option value="Commander">Commander</option>
                                    <option value="Modern">Modern</option>
                                    <option value="Pauper">Pauper</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn btn-ghost"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Criar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeckListPage;
