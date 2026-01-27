import { API_URLS } from '../config/api';
import authService from './authService';

const ALERTS_API = `${API_URLS.CATALOG}/alerts`;

const priceAlertService = {
    getAlerts: async () => {
        const token = authService.getToken();
        const response = await fetch(`${ALERTS_API}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch alerts');
        return response.json();
    },

    createAlert: async (alertData) => {
        const token = authService.getToken();
        const response = await fetch(`${ALERTS_API}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(alertData)
        });
        if (!response.ok) throw new Error('Failed to create alert');
        return response.json();
    },

    deleteAlert: async (id) => {
        const token = authService.getToken();
        const response = await fetch(`${ALERTS_API}/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete alert');
        return true;
    }
};

export default priceAlertService;
