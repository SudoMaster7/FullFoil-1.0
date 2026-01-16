import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import MegaMenu from './components/MegaMenu'
import MobileSidebar from './components/MobileSidebar'
import Hero from './components/Hero'
import CardGrid from './components/CardGrid'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import CatalogPage from './pages/CatalogPage'
import CardDetailPage from './pages/CardDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import OrdersPage from './pages/OrdersPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BecomeSellerPage from './pages/BecomeSellerPage'
import { FilterProvider } from './contexts/FilterContext'
import { CartProvider } from './contexts/CartContext'
import { OrderProvider } from './contexts/OrderContext'
import { AuthProvider } from './contexts/AuthContext'
import CreateListingPage from './pages/CreateListingPage'
import MarketplacePage from './pages/MarketplacePage'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('home');
  const [activeGame, setActiveGame] = useState(null);
  const [cardId, setCardId] = useState(null);

  // Parse hash and update route
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove '#'

      // Check for card detail route (e.g., /magic/card/123)
      const cardDetailMatch = hash.match(/^\/([a-z]+)\/card\/([^/]+)$/);
      if (cardDetailMatch) {
        const [, game, id] = cardDetailMatch;
        setCurrentRoute('card-detail');
        setActiveGame(game);
        setCardId(id);
        return;
      }

      // Check for login/register routes
      if (hash === '/login') {
        setCurrentRoute('login');
        setActiveGame(null);
        setCardId(null);
        return;
      }

      if (hash === '/register') {
        setCurrentRoute('register');
        setActiveGame(null);
        setCardId(null);
        return;
      }

      if (hash === '/become-seller') {
        setCurrentRoute('become-seller');
        setActiveGame(null);
        setCardId(null);
        return;
      }

      if (hash === '/create-listing') {
        setCurrentRoute('create-listing');
        setActiveGame(null);
        setCardId(null);
        return;
      }

      if (hash === '/marketplace') {
        setCurrentRoute('marketplace');
        setActiveGame(null);
        setCardId(null);
        return;
      }

      // Check for checkout route
      if (hash === '/checkout') {
        setCurrentRoute('checkout');
        setActiveGame(null);
        setCardId(null);
        return;
      }

      // Check for orders routes
      if (hash === '/orders') {
        setCurrentRoute('orders');
        setActiveGame(null);
        setCardId(null);
        return;
      }

      const orderDetailMatch = hash.match(/^\/orders\/([^/]+)$/);
      if (orderDetailMatch) {
        setCurrentRoute('order-detail');
        setActiveGame(null);
        setCardId(orderDetailMatch[1]);
        return;
      }

      if (!hash || hash === '/' || hash === '/home') {
        setCurrentRoute('home');
        setActiveGame(null);
        setCardId(null);
      } else if (hash.startsWith('/magic')) {
        setCurrentRoute('catalog');
        setActiveGame('magic');
        setCardId(null);
      } else if (hash.startsWith('/pokemon')) {
        setCurrentRoute('catalog');
        setActiveGame('pokemon');
        setCardId(null);
      } else if (hash.startsWith('/yugioh')) {
        setCurrentRoute('catalog');
        setActiveGame('yugioh');
        setCardId(null);
      } else if (hash.startsWith('/lorcana')) {
        setCurrentRoute('catalog');
        setActiveGame('lorcana');
        setCardId(null);
      } else if (hash.startsWith('/onepiece')) {
        setCurrentRoute('catalog');
        setActiveGame('onepiece');
        setCardId(null);
      } else {
        setCurrentRoute('home');
        setActiveGame(null);
        setCardId(null);
      }
    };

    // Initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <FilterProvider>
            <div className="app">
              <Navbar onMenuClick={() => setSidebarOpen(true)} />
              <MegaMenu activeRoute={activeGame} />
              <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

              {currentRoute === 'home' ? (
                <main>
                  <Hero />
                  <CardGrid title="Cartas em Destaque" />
                  <CardGrid title="Chegadas Recentes" />
                </main>
              ) : currentRoute === 'catalog' && activeGame ? (
                <main>
                  <CatalogPage gameType={activeGame} />
                </main>
              ) : currentRoute === 'card-detail' && activeGame && cardId ? (
                <main>
                  <CardDetailPage game={activeGame} cardId={cardId} />
                </main>
              ) : currentRoute === 'checkout' ? (
                <main>
                  <CheckoutPage />
                </main>
              ) : currentRoute === 'orders' ? (
                <main>
                  <OrdersPage />
                </main>
              ) : currentRoute === 'order-detail' && cardId ? (
                <main>
                  <OrderConfirmationPage />
                </main>
              ) : currentRoute === 'login' ? (
                <main>
                  <LoginPage />
                </main>
              ) : currentRoute === 'register' ? (
                <main>
                  <RegisterPage />
                </main>
              ) : currentRoute === 'become-seller' ? (
                <main>
                  <BecomeSellerPage />
                </main>
              ) : currentRoute === 'create-listing' ? (
                <main>
                  <CreateListingPage />
                </main>
              ) : currentRoute === 'marketplace' ? (
                <main>
                  <MarketplacePage />
                </main>
              ) : (
                <main>
                  <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                    <h1>Página não encontrada</h1>
                    <a href="#/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                      Voltar para Home
                    </a>
                  </div>
                </main>
              )}

              <CartDrawer />
              <Footer />
              <Toaster position="bottom-right" toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }
              }} />
            </div>
          </FilterProvider>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App
