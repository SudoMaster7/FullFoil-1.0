/**
 * AuthContext - FullFoil
 * 
 * Authentication context for React app.
 * Integrated with Django SimpleJWT backend.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Auto-login on mount
    useEffect(() => {
        const savedToken = authService.getToken();
        const savedUser = authService.getStoredUser();

        if (savedToken) {
            // Try to get fresh user data
            authService.getMe(savedToken)
                .then(({ user: freshUser }) => {
                    setToken(savedToken);
                    setUser(freshUser);
                })
                .catch((error) => {
                    console.error('Auto-login failed:', error);
                    // Try to use stored user if available
                    if (savedUser) {
                        setToken(savedToken);
                        setUser(savedUser);
                    } else {
                        authService.logout();
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (savedUser) {
            // Fallback to stored user
            setUser(savedUser);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);

    /**
     * Login with username/email and password
     */
    const login = async (username, password) => {
        try {
            const result = await authService.login(username, password);
            setToken(result.token);
            setUser(result.user);

            const displayName = result.user.first_name || result.user.username || 'Usuário';
            toast.success(`Bem-vindo, ${displayName}!`);
            return result.user;
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    };

    /**
     * Register new user
     */
    const register = async (formData) => {
        try {
            // formData can be {username, email, password, firstName, lastName}
            // or legacy {email, password, name}
            const email = formData.email || '';
            const username = formData.username || email.split('@')[0] || '';
            const password = formData.password || '';
            const name = formData.name || '';
            const firstName = formData.firstName || (name ? name.split(' ')[0] : '') || '';
            const lastName = formData.lastName || (name ? name.split(' ').slice(1).join(' ') : '') || '';

            const result = await authService.register(username, email, password, firstName, lastName);

            if (result && result.tokens) {
                setToken(result.tokens.access);
            }
            if (result && result.user) {
                setUser(result.user);
                const displayName = result.user.first_name || result.user.username || 'Usuário';
                toast.success(`Conta criada com sucesso! Bem-vindo, ${displayName}!`);
            }

            return result?.user;
        } catch (error) {
            toast.error(error.message || 'Erro ao criar conta');
            throw error;
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        authService.logout();
        setToken(null);
        setUser(null);
        toast.success('Logout realizado com sucesso');
        window.location.hash = '#/';
    };

    /**
     * Update user profile
     */
    const updateProfile = async (updates) => {
        try {
            const result = await authService.updateProfile(updates);
            if (result.user) {
                setUser(result.user);
                toast.success('Perfil atualizado!');
            }
            return result.user;
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    };

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
