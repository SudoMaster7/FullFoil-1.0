import { API_URLS } from '../config/api';
import authService from './authService';

const userService = {
    getAddresses: async () => {
        const token = authService.getToken();
        const response = await fetch(`${API_URLS.USERS}/addresses/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch addresses');
        return response.json();
    },

    createAddress: async (addressData) => {
        const token = authService.getToken();
        const response = await fetch(`${API_URLS.USERS}/addresses/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(addressData)
        });
        if (!response.ok) throw new Error('Failed to create address');
        return response.json();
    },

    updateAddress: async (id, addressData) => {
        const token = authService.getToken();
        const response = await fetch(`${API_URLS.USERS}/addresses/${id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(addressData)
        });
        if (!response.ok) throw new Error('Failed to update address');
        return response.json();
    },

    deleteAddress: async (id) => {
        const token = authService.getToken();
        const response = await fetch(`${API_URLS.USERS}/addresses/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete address');
        return true;
    },

    setAsDefault: async (id) => {
        return userService.updateAddress(id, { is_default: true });
    }
};

export default userService;
