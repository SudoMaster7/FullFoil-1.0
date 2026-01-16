import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, register as registerService, getMe } from '../services/authService';
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
        const savedToken = localStorage.getItem('auth_token');
        if (savedToken) {
            getMe(savedToken)
                .then(({ user }) => {
                    setToken(savedToken);
                    setUser(user);
                })
                .catch((error) => {
                    console.error('Auto-login failed:', error);
                    localStorage.removeItem('auth_token');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const { token: newToken, user: newUser } = await loginService(email, password);
            localStorage.setItem('auth_token', newToken);
            setToken(newToken);
            setUser(newUser);
            toast.success(`Bem-vindo, ${newUser.name}!`);
            return newUser;
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    };

    const register = async (email, password, name) => {
        try {
            const { token: newToken, user: newUser } = await registerService(email, password, name);
            localStorage.setItem('auth_token', newToken);
            setToken(newToken);
            setUser(newUser);
            toast.success(`Conta criada com sucesso! Bem-vindo, ${newUser.name}!`);
            return newUser;
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        toast.success('Logout realizado com sucesso');
        window.location.hash = '#/';
    };

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
