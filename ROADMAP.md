# Roadmap FullFoil → TCGPlayer Level Marketplace

## 🎯 Objetivo
Transformar o FullFoil em um marketplace completo e profissional, inspirado no **TCGPlayer.com**, o maior marketplace de TCG do mundo.

---

## 📊 Análise TCGPlayer.com - Features Principais

### 1. **Sistema de Precificação Avançado**
- ✅ Market Price (média do mercado)
- ✅ Low/Mid/High pricing
- ✅ Price trends (gráficos históricos)
- ✅ Price guides por condição
- ✅ Foil vs Non-foil pricing

### 2. **Funcionalidades de Compra**
- ✅ Cart Optimizer (melhor combinação de vendedores)
- ✅ Multiple sellers em um único checkout
- ✅ Cálculo de frete consolidado
- ✅ Proteção ao comprador
- ✅ Direct checkout

### 3. **Sistema de Vendedor**
- ✅ Seller dashboard completo
- ✅ Inventory management
- ✅ Pricing tools automáticos
- ✅ Shipping labels
- ✅ Seller ratings & reviews
- ✅ Buylist (venda para a loja)

### 4. **Ferramentas de Deck Building**
- ✅ Deck builder integrado
- ✅ Importar/exportar decklists
- ✅ Calcular preço total do deck
- ✅ Comprar deck completo
- ✅ Sugestões de cartas

### 5. **Features Avançadas**
- ✅ Wishlist/Favorites
- ✅ Collection tracking
- ✅ Price alerts
- ✅ Mass entry (adicionar múltiplas cartas)
- ✅ Advanced search
- ✅ Set checklists

---

## 🚀 Roadmap de Implementação

### **FASE 5: Sistema de Carrinho de Compras** 🛒✅
**Status:** ✅ **COMPLETO**  
**Duração:** Concluído em 15/01/2026

#### Objetivos
- ✅ Carrinho funcional com múltiplas cartas
- ✅ Persistência local
- ✅ Cálculo de totais

#### Tarefas
- [x] Criar `CartContext` com gerenciamento de estado
- [x] Implementar `CartButton` (ícone + contador animado)
- [x] Criar `CartDrawer` lateral responsivo
- [x] Funcionalidades:
  - [x] Adicionar/remover cartas
  - [x] Ajustar quantidades (+/-)
  - [x] Calcular subtotal, impostos (10%), total
  - [x] Feedback visual nos cards
- [x] Persistir no `localStorage`
- [x] Toast notifications (react-hot-toast)
- [x] Animações de feedback
- [x] Integração com todos os TCGs

#### Features Extras Implementadas
- [x] **Página de Detalhes da Carta** com:
  - [x] CardViewer3D interativo (rotação, zoom, flip)
  - [x] Efeitos holográficos e glare
  - [x] Gráfico de histórico de preços (30/90/365 dias)
  - [x] Estatísticas de preço (min, avg, max, trend)
  - [x] Informações completas da carta
  - [x] Legalidade por formato
  - [x] MarketplaceListings com ratings de vendedores
- [x] **Sistema de Paginação**
  - [x] Paginação numerada (50 cards/página)
  - [x] Navegação: Primeira/Anterior/Próxima/Última
  - [x] Ellipsis inteligente para muitas páginas
  - [x] Info de página atual
- [x] **Melhorias nas APIs**
  - [x] Magic: Query otimizada
  - [x] Yu-Gi-Oh: 500 cards por request
  - [x] Pokémon: Paginação consistente
  - [x] Todas com 50 cards/página padronizado

---

### **FASE 6: Sistema de Checkout** 💳
**Status:** 🎯 **PRÓXIMA FASE**  
**Duração:** 2-3 semanas

#### Objetivos
- Processo de checkout completo
- Múltiplas formas de pagamento
- Confirmação de pedido

#### Tarefas Backend
- [ ] Criar modelo de `Order` no banco
- [ ] Endpoints de pedido
- [ ] Integração com gateway de pagamento:
  - [ ] Stripe (recomendado)
  - [ ] PayPal
  - [ ] Mercado Pago (BR)
- [ ] Cálculo de frete (integrar Correios/Melhor Envio)
- [ ] Sistema de email (confirmação, rastreamento)

#### Tarefas Frontend
- [ ] Página de checkout multi-step:
  1. Revisão do carrinho
  2. Informações de envio
  3. Método de pagamento
  4. Confirmação
- [ ] Validação de formulários (React Hook Form + Zod)
- [ ] Página de confirmação de pedido
- [ ] Página "Meus Pedidos"

---

### **FASE 7: Autenticação & Perfis de Usuário** 👤
**Duração:** 2-3 semanas

#### Backend
- [ ] Implementar JWT authentication
- [ ] Rotas de registro/login/logout
- [ ] MongoDB/PostgreSQL para usuários
- [ ] Hash de senhas (bcrypt)
- [ ] Email verification
- [ ] Password reset
- [ ] OAuth (Google, Facebook opcional)

#### Frontend
- [ ] Páginas de Login/Registro
- [ ] Contexto de autenticação
- [ ] Protected routes
- [ ] Perfil do usuário:
  - [ ] Informações pessoais
  - [ ] Endereços salvos
  - [ ] Métodos de pagamento salvos
  - [ ] Histórico de pedidos
  - [ ] Wishlist
  - [ ] Collection tracking

---

### **FASE 8: Sistema de Precificação Avançado** 📈
**Duração:** 2-3 semanas

#### Objetivos
- Implementar price tracking
- Gráficos de histórico de preços
- Alertas de preço

#### Tarefas
- [ ] **Price History Database**
  - [ ] Criar tabela de histórico de preços
  - [ ] Job diário para coletar preços das APIs
  - [ ] Armazenar preços por data
  
- [ ] **Price Charts**
  - [ ] Integrar Chart.js ou Recharts
  - [ ] Gráfico de preço nos últimos 30/90/365 dias
  - [ ] Indicadores: Low/Mid/High
  
- [ ] **Price Alerts**
  - [ ] Sistema de notificações
  - [ ] Email quando preço atingir valor desejado
  - [ ] Configurar alertas por carta
  
- [ ] **Price Guide**
  - [ ] Preços por condição (NM, LP, MP, HP, DMG)
  - [ ] Foil vs Non-foil
  - [ ] First Edition vs Unlimited

---

### **FASE 9: Sistema Multi-Vendedor** 🏪
**Duração:** 3-4 semanas

#### Objetivos
- Permitir múltiplos vendedores
- Marketplace real com comissões
- Reviews e ratings

#### Tarefas
- [ ] **Seller Registration**
  - [ ] Formulário de cadastro de vendedor
  - [ ] Verificação de identidade
  - [ ] Terms of service
  
- [ ] **Seller Dashboard**
  - [ ] Painel de controle completo
  - [ ] Analytics (vendas, visualizações)
  - [ ] Inventory management
  - [ ] Bulk upload de cartas (CSV)
  - [ ] Pricing tools automáticos
  
- [ ] **Cart Optimization** (como TCGPlayer)
  - [ ] Algoritmo para combinar cartas de múltiplos vendedores
  - [ ] Minimizar frete total
  - [ ] Sugestões de sellers alternativos
  
- [ ] **Commission System**
  - [ ] Calcular comissão por venda
  - [ ] Payouts automáticos
  - [ ] Invoice generation
  
- [ ] **Reviews & Ratings**
  - [ ] Sistema de avaliação de vendedores
  - [ ] Reviews de produtos
  - [ ] Seller badges (top seller, verified, etc.)

---

### **FASE 10: Deck Builder & Collection Manager** 🎴
**Duração:** 2-3 semanas

#### Deck Builder
- [ ] Interface drag-and-drop
- [ ] Importar decklist (texto/URL)
- [ ] Exportar para Arena, MTGO, etc.
- [ ] Categorias: Commander, Sideboard, Maybeboard
- [ ] Análise de deck:
  - [ ] Mana curve
  - [ ] Color distribution
  - [ ] Card types breakdown
- [ ] **Calcular preço total do deck**
- [ ] **Botão "Buy Deck"** (adicionar tudo ao carrinho)

#### Collection Manager
- [ ] Adicionar cartas à coleção
- [ ] Marcar cartas como owned/want
- [ ] Track collection value
- [ ] Portfolio insights
- [ ] Export collection

---

### **FASE 11: Buylist System** 💰
**Duração:** 2-3 semanas

#### Objetivos
- Permitir usuários venderem para a loja
- Processo de buylist simplificado

#### Tarefas
- [ ] Página de buylist por jogo
- [ ] Buscar cartas para vender
- [ ] Mostrar preço de compra
- [ ] Adicionar ao buylist cart
- [ ] Processo de envio:
  - [ ] Gerar shipping label
  - [ ] Confirmação de recebimento
  - [ ] Pagamento via PayPal/PIX
- [ ] Admin dashboard para processar buylist

---

### **FASE 12: Features Avançadas** ⚡
**Duração:** 3-4 semanas

#### Advanced Search
- [ ] Filtros avançados:
  - [ ] Por texto (nome, text box, artist)
  - [ ] Por mechanics
  - [ ] Por mana cost
  - [ ] Por power/toughness
- [ ] Saved searches
- [ ] Search suggestions

#### Mass Entry
- [ ] Adicionar múltiplas cartas de uma vez
- [ ] Input por quantidade + nome
- [ ] Importar de arquivo

#### Set Checklists
- [ ] Checklist por set
- [ ] Marcar cartas owned
- [ ] Mostrar progresso de coleção

#### Price Comparison
- [ ] Comparar preços entre sellers
- [ ] Mostrar melhor oferta
- [ ] Filters por seller rating, shipping time

---

### **FASE 13: Mobile App** 📱
**Duração:** 4-6 semanas

- [ ] React Native ou Flutter
- [ ] Todas as features do web
- [ ] Barcode scanner para adicionar cartas
- [ ] Push notifications
- [ ] Offline mode

---

### **FASE 14: Polish & SEO** 🎨
**Duração:** 2-3 semanas

#### Performance
- [ ] Image optimization (WebP, lazy loading)
- [ ] Code splitting
- [ ] CDN para assets
- [ ] Server-side rendering (Next.js)

#### SEO
- [ ] Meta tags dinâmicas
- [ ] Open Graph para social sharing
- [ ] Sitemap.xml
- [ ] Structured data (Schema.org)

#### Acessibilidade
- [ ] WCAG 2.1 compliance
- [ ] Keyboard navigation
- [ ] Screen reader support

---

## 📊 Dados de Preço - Fontes Alternativas

### Como TCGPlayer API está fechada, usar:

1. **Magic: The Gathering**
   - ✅ Scryfall API (já implementado)
   - ➕ Cardmarket API (Europa)
   - ➕ TCGPlayer data via Scryfall

2. **Pokémon TCG**
   - ✅ PokemonTCG.io API (já implementado)
   - ➕ PriceCharting API (pago)
   
3. **Yu-Gi-Oh**
   - ✅ YGOPRODECK API (já implementado)
   - ➕ TCGPlayer data scraping (legal review needed)

4. **Lorcana**
   - ✅ lorcana-api.com
   
5. **One Piece**
   - ✅ OPTCG API (já implementado)

---

## 🎯 Prioridades Imediatas

1. ✅ **FASE 5: Carrinho** → ✅ **COMPLETO** (15/01/2026)
2. 🎯 **FASE 6: Checkout** → PRÓXIMA (iniciar em breve)
3. **FASE 7: Auth** → Fundamental para user experience
4. **FASE 8: Price Tracking** → Diferencial competitivo
5. **FASE 9: Multi-seller** → Transformar em verdadeiro marketplace

---

## 📈 Métricas de Sucesso

- 1000+ usuários registrados
- 10+ vendedores ativos
- $10k+ em GMV (Gross Merchandise Value)
- 4.5+ rating médio
- <2s page load time
- 95%+ uptime

---

**Status Atual:** ✅ Fase 5 Completa  
**Próximo passo recomendado:** Iniciar FASE 6 - Sistema de Checkout

**Deploy:** Pronto para hospedagem na Vercel!
