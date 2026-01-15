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
import { FilterProvider } from './contexts/FilterContext'
import { CartProvider } from './contexts/CartContext'
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
    <CartProvider>
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
    </CartProvider>
  );
}

export default App
