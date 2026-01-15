# 🚀 Guia de Deploy - Vercel

## Visão Geral
Este guia vai te ajudar a fazer deploy do TCG Marketplace na Vercel, incluindo tanto o backend quanto o frontend.

---

## 📋 Pré-requisitos
- ✅ Conta no GitHub
- ✅ Conta no Vercel (pode usar login do GitHub)
- ✅ Código commitado no GitHub

---

## 🔧 Parte 1: Deploy do Backend

### Passo 1: Preparar Repositório
O backend já está configurado com:
- ✅ `server/vercel.json` - Configuração do Vercel
- ✅ `server/.env.example` - Exemplo de variáveis de ambiente
- ✅ CORS configurado para produção

### Passo 2: Criar Projeto no Vercel (Backend)

1. **Acesse**: https://vercel.com/dashboard
2. **Clique em**: "Add New..." → "Project"
3. **Import Git Repository**:
   - Selecione seu repositório do GitHub
   - Clique em "Import"
4. **Configure o Projeto**:
   ```
   Project Name: tcg-backend (ou nome de sua escolha)
   Framework Preset: Other
   Root Directory: server
   Build Command: (deixe em branco ou use "npm install")
   Output Directory: (deixe em branco)
   Install Command: npm install
   ```

5. **Adicione Variáveis de Ambiente**:
   Vá em "Environment Variables" e adicione:
   ```
   NODE_ENV = production
   FRONTEND_URL = https://full-foil-1-0.vercel.app
   ```

6. **Clique em "Deploy"**

7. **Aguarde o Deploy** (geralmente 1-2 minutos)

8. **Copie a URL do Backend**:
   - Após o deploy, você terá uma URL como: `https://tcg-backend-xxx.vercel.app`
   - **COPIE ESSA URL** - você vai precisar dela!

---

## 🎨 Parte 2: Configurar Frontend

### Passo 1: Atualizar Variáveis de Ambiente no Vercel

1. **Acesse seu projeto frontend** no Vercel: https://vercel.com/dashboard
2. **Vá em Settings** → **Environment Variables**
3. **Adicione a variável**:
   ```
   Name: VITE_API_URL
   Value: https://tcg-backend-xxx.vercel.app/api (cole a URL do backend que você copiou)
   ```
   > ⚠️ **IMPORTANTE**: Adicione `/api` no final da URL do backend!

4. **Selecione**: Production, Preview, Development
5. **Clique em "Save"**

### Passo 2: Fazer Redeploy do Frontend

1. **Vá em "Deployments"**
2. **Clique nos 3 pontinhos** do último deployment
3. **Selecione "Redeploy"**
4. **Aguarde o deploy** (1-2 minutos)

---

## ✅ Parte 3: Verificação

### Teste o Backend
1. Abra no navegador: `https://tcg-backend-xxx.vercel.app/health`
2. Você deve ver:
   ```json
   {
     "status": "OK",
     "timestamp": "2026-01-15T..."
   }
   ```

### Teste o Frontend
1. Abra: `https://full-foil-1-0.vercel.app`
2. **Navegue para cada jogo**:
   - Magic: The Gathering
   - Pokémon
   - Yu-Gi-Oh
   - Disney Lorcana
   - One Piece
3. **Verifique**:
   - ✅ Cartas estão carregando
   - ✅ Imagens aparecem corretamente
   - ✅ Paginação funciona
   - ✅ Filtros aplicam corretamente
   - ✅ Carrinho funciona
   - ✅ Sem erros no console do navegador (F12)

---

## 🐛 Solução de Problemas

### Erro: "Failed to fetch"
- ✅ Verifique se a URL do backend está correta na variável `VITE_API_URL`
- ✅ Certifique-se de adicionar `/api` no final
- ✅ Verifique se o backend está rodando: teste o `/health` endpoint

### Erro: CORS
- ✅ Verifique se `FRONTEND_URL` está configurada corretamente no backend
- ✅ Deve ser exatamente: `https://full-foil-1-0.vercel.app` (sem barra final)

### Cartas não carregam
- ✅ Abra o console do navegador (F12)
- ✅ Veja se há erros de API
- ✅ Verifique se a URL do backend está acessível

### Deploy falha
- ✅ Certifique-se de que todas as dependências estão no `package.json`
- ✅ Veja os logs do build na Vercel
- ✅ Root Directory deve estar correto (`server` para backend)

---

## 🔄 Atualizações Futuras

Sempre que fizer mudanças no código:

1. **Commit no GitHub**:
   ```bash
   git add .
   git commit -m "Descrição das mudanças"
   git push
   ```

2. **Deploy Automático**:
   - Vercel detecta automaticamente e faz redeploy
   - Aguarde 1-2 minutos para o deploy completar

---

## 📝 Resumo de URLs

Após configurar tudo, você terá:

- **Frontend**: `https://full-foil-1-0.vercel.app`
- **Backend**: `https://tcg-backend-xxx.vercel.app`
- **Health Check**: `https://tcg-backend-xxx.vercel.app/health`

---

## ✨ Próximos Passos

Com o deploy funcionando, você pode:
- ✅ Implementar Phase 6: Checkout System
- ✅ Adicionar autenticação de usuários
- ✅ Implementar sistema de pagamento
- ✅ Adicionar domínio personalizado

---

**Pronto! Seu TCG Marketplace está agora em produção! 🎉**
