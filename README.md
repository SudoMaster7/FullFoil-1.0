# FullFoil TCG Marketplace

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/tcg-marketplace)

## 🎮 Sobre o Projeto

FullFoil é um marketplace completo de Trading Card Games (TCG) inspirado no TCGPlayer.com, suportando múltiplos jogos:
- 🔮 Magic: The Gathering
- ⚡ Pokémon TCG  
- 🎴 Yu-Gi-Oh!
- ✨ Disney Lorcana
- 🏴‍☠️ One Piece Card Game

## ✨ Features Implementadas

### ✅ Fase 5: Sistema de Carrinho Completo
- Carrinho de compras funcional
- Persistência em localStorage
- Toast notifications
- Drawer lateral responsivo
- Cálculo automático de totais e impostos

### ✅ Página de Detalhes da Carta
- CardViewer3D interativo (rotação, zoom, flip)
- Efeitos holográficos realistas
- Gráfico de histórico de preços (30/90/365 dias)
- Estatísticas de preço (min, avg, max, trend)
- Informações completas e legalidade
- MarketplaceListings com ratings

### ✅ Sistema de Paginação
- Paginação numerada (50 cards/página)
- Navegação completa
- Responsive design

## 🚀 Deploy

### Frontend (Vercel)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd tcg
vercel
```

### Backend (Vercel ou Railway)
```bash
cd server
vercel
```

## 🛠️ Tecnologias

- **Frontend:** React + Vite, CSS Modules
- **Backend:** Node.js + Express
- **APIs:** Scryfall, PokémonTCG.io, YGOPRODECK, Lorcana API, OPTCG
- **Libs:** Recharts, Lucide Icons, React Hot Toast

## 📖 Ver Roadmap Completo

Veja [ROADMAP.md](./ROADMAP.md) para detalhes de todas as fases planejadas.

## 🎯 Próxima Fase

**Fase 6:** Sistema de Checkout com integração de pagamento

---

**Licença:** MIT  
**Autor:** Leonardo Santos
