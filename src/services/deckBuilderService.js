import { API_URLS } from '../config/api';
import authService from './authService';

const DECKS_API = `${API_URLS.BASE_URL}/api/builder/decks`;

export const getMyDecks = async () => {
    const token = authService.getToken();
    const response = await fetch(`${DECKS_API}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch decks');
    return await response.json();
};

export const getDeck = async (id) => {
    const token = authService.getToken();
    const response = await fetch(`${DECKS_API}/${id}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch deck');
    return await response.json();
};

export const createDeck = async (deckData) => {
    const token = authService.getToken();
    const response = await fetch(`${DECKS_API}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deckData)
    });
    if (!response.ok) throw new Error('Failed to create deck');
    return await response.json();
};

export const addCardToDeck = async (deckId, cardData) => {
    const token = authService.getToken();
    const response = await fetch(`${DECKS_API}/${deckId}/add_card/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cardData)
    });
    if (!response.ok) throw new Error('Failed to add card to deck');
    return await response.json();
};

export const removeCardFromDeck = async (deckId, cardId) => {
    const token = authService.getToken();
    const response = await fetch(`${DECKS_API}/${deckId}/remove_card/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ card_id: cardId })
    });
    if (!response.ok) throw new Error('Failed to remove card from deck');
    return await response.json();
};

export default {
    getMyDecks,
    getDeck,
    createDeck,
    addCardToDeck,
    removeCardFromDeck
};
