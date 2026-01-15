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

## 🔧 Configuração

### Variáveis de Ambiente

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001/api
```

Para produção na Vercel, configure:
- `VITE_API_URL` → URL do seu backend (ex: `https://your-backend.vercel.app/api`)

#### Backend (server/.env)
```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Para produção na Vercel, configure:
- `NODE_ENV` → `production`
- `FRONTEND_URL` → URL do seu frontend (ex: `https://full-foil-1-0.vercel.app`)

> 📝 **Nota**: Exemplos de configuração estão nos arquivos `.env.example`

## 🚀 Deploy

Para instruções completas de deploy, veja o [Guia de Deployment](./VERCEL_DEPLOYMENT_GUIDE.md).

### Frontend (Vercel)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd tcg
vercel
```

### Backend (Vercel)
```bash
cd server
vercel
```

> ⚠️ **Importante**: Configure as variáveis de ambiente no dashboard da Vercel após o deploy inicial.

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
