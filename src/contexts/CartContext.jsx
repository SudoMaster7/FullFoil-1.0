import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({
        items: [],
        itemCount: 0,
        subtotal: 0,
        tax: 0,
        total: 0
    });
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('fullfoil_cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCart(parsedCart);
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('fullfoil_cart', JSON.stringify(cart));
    }, [cart]);

    // Calculate cart totals
    const calculateTotals = (items) => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.1; // 10% tax (adjust as needed)
        const total = subtotal + tax;
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return {
            itemCount,
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
    };

    // Add item to cart
    const addToCart = (card, quantity = 1) => {
        if (!card || !card.id || !card.price || card.price <= 0) {
            toast.error('Não é possível adicionar esta carta ao carrinho');
            return;
        }

        setCart(prevCart => {
            const existingItemIndex = prevCart.items.findIndex(
                item => item.cardId === card.id && item.condition === card.condition
            );

            let newItems;
            if (existingItemIndex >= 0) {
                // Update quantity of existing item
                newItems = [...prevCart.items];
                newItems[existingItemIndex].quantity += quantity;
                toast.success(`Quantidade atualizada para ${newItems[existingItemIndex].quantity}`);
            } else {
                // Add new item
                const cartItem = {
                    id: `${card.id}-${card.condition}-${Date.now()}`,
                    cardId: card.id,
                    name: card.name,
                    game: card.game,
                    set: card.set,
                    condition: card.condition,
                    rarity: card.rarity,
                    price: card.price,
                    image: card.imageSmall || card.image,
                    quantity: quantity
                };
                newItems = [...prevCart.items, cartItem];
                toast.success(`${card.name} adicionado ao carrinho!`);
            }

            const totals = calculateTotals(newItems);
            return {
                items: newItems,
                ...totals
            };
        });
    };

    // Remove item from cart
    const removeFromCart = (itemId) => {
        setCart(prevCart => {
            const newItems = prevCart.items.filter(item => item.id !== itemId);
            const totals = calculateTotals(newItems);
            toast.success('Item removido do carrinho');
            return {
                items: newItems,
                ...totals
            };
        });
    };

    // Update item quantity
    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }

        if (newQuantity > 99) {
            toast.error('Quantidade máxima é 99');
            return;
        }

        setCart(prevCart => {
            const newItems = prevCart.items.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            );
            const totals = calculateTotals(newItems);
            return {
                items: newItems,
                ...totals
            };
        });
    };

    // Clear entire cart
    const clearCart = () => {
        setCart({
            items: [],
            itemCount: 0,
            subtotal: 0,
            tax: 0,
            total: 0
        });
        toast.success('Carrinho limpo');
    };

    // Toggle cart drawer
    const toggleCart = () => {
        setIsCartOpen(prev => !prev);
    };

    // Check if item is in cart
    const isInCart = (cardId) => {
        return cart.items.some(item => item.cardId === cardId);
    };

    const value = {
        cart,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        setIsCartOpen,
        isInCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
