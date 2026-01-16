import React, { createContext, useContext, useState, useEffect } from 'react';
import { createOrder, getAllOrders } from '../services/orderService';

const OrderContext = createContext();

export function useOrders() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within OrderProvider');
    }
    return context;
}

export function OrderProvider({ children }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load orders from localStorage on mount
    useEffect(() => {
        const savedOrders = localStorage.getItem('fullfoil_orders');
        if (savedOrders) {
            try {
                setOrders(JSON.parse(savedOrders));
            } catch (err) {
                console.error('Error loading orders from localStorage:', err);
            }
        }
    }, []);

    // Save orders to localStorage whenever they change
    useEffect(() => {
        if (orders.length > 0) {
            localStorage.setItem('fullfoil_orders', JSON.stringify(orders));
        }
    }, [orders]);

    const addOrder = async (orderData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await createOrder(orderData);
            const newOrder = response.order;

            setOrders(prev => [newOrder, ...prev]);
            return newOrder;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const refreshOrders = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getAllOrders();
            setOrders(response.orders);
        } catch (err) {
            setError(err.message);
            console.error('Error refreshing orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const getOrderById = (orderId) => {
        return orders.find(order => order.id === orderId);
    };

    const value = {
        orders,
        loading,
        error,
        addOrder,
        refreshOrders,
        getOrderById,
        setOrders,
        setLoading
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
}

export default OrderContext;
