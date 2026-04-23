# Performance Social Media - Documentação Completa

## Índice
1. [Visão Geral do Projeto](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura)
3. [Histórico de Desenvolvimento](#histórico)
4. [Problemas Encontrados e Soluções](#problemas-e-soluções)
5. [Guia de Instalação](#guia-de-instalação)
6. [Estrutura de Arquivos](#estrutura-de-arquivos)
7. [APIs e Endpoints](#apis-e-endpoints)
8. [Modelo de Dados](#modelo-de-dados)
9. [Sistema de IA](#sistema-de-ia)
10. [Deploy e Manutenção](#deploy-e-manutenção)

---

## Visão Geral

### O que é
Plataforma SaaS para gestão de múltiplos clientes e geração automatizada de conteúdo estratégico para Instagram, com IA customizável por perfil.

### Funcionalidades Principais
- **Multi-Cliente**: Gestão isolada de vários clientes
- **IA por Nicho**: Personas especializadas (e-commerce, saúde, beleza, etc.)
- **Calendário Editorial**: Geração automática com frequências configuráveis
- **Funil de Conteúdo**: Distribuição automática (Atenção → Interesse → Desejo → Ação)
- **Backlog**: Gestão de posts pendentes e atrasados
- **Fallback de IA**: Gemini + OpenAI

### Frequências Suportadas
| Tipo | Frequência | Mensal |
|------|------------|--------|
| Stories | 3/dia | ~90 |
| Reels | 3/semana | ~12 |
| Feeds | 2/semana | ~8 |

---

## Arquitetura

### Stack Tecnológica
```
Frontend: Next.js 16.2.4 + React 19.2.4 + TypeScript 5
Estilização: Tailwind CSS 4 + Framer Motion
Backend: Next.js API Routes
Banco de Dados: Supabase (PostgreSQL)
Autenticação: Supabase Auth
IA: Google Gemini Flash + OpenAI GPT-4o (fallback)
Deploy: Vercel
```

### Fluxo de Dados
```
Usuário → Next.js → API Routes → Supabase
                ↓
           Google Gemini
           (fallback: OpenAI)
```

---

## Histórico de Desenvolvimento

### Fase 1: Fundação (Commit Inicial)
- Sistema básico de geração de cronograma
- Autenticação com Supabase
- Chat com IA

### Fase 2: Multi-Cliente (v0.2.0)
**Commits:**
- `016fb62` - feat: implement multi-client system
- `cdb4a96` - docs: add documentation
- `28a53ed` - fix: optimize chat panel
- `7ad4c8c` - docs: add troubleshooting
- `8a2cab2` - fix: handle duplicate policies
- `baa2cf9` - fix: SQL syntax error

**Funcionalidades Adicionadas:**
- Sistema de clientes com personas de IA
- Backlog para posts pendentes
- Calendário editorial com funil
- Interface de gestão de clientes

---

## Problemas e Soluções

### Problema 1: Erro ao Criar Cliente
**Sintoma:** Nada acontecia ao tentar criar cliente

**Causa:** Tabelas do banco não criadas

**Solução:**
1. Executar SQL de migração: `supabase/migrations/001_multi_client_schema.sql`
2. Verificar em Table Editor se as 4 tabelas existem

### Problema 2: SQL - Policy Already Exists
**Sintoma:** `ERROR: 42710: policy "..." already exists`

**Causa:** Rodar o SQL mais de uma vez

**Solução:** SQL atualizado com blocos `DO $$ EXCEPTION` para ignorar duplicatas

### Problema 3: SQL - Syntax Error
**Sintoma:** `ERROR: 42601: syntax error at or near "-"`

**Causa:** Arquivo começava com caractere inválido

**Solução:** Recriar arquivo SQL sem caracteres especiais no início

### Problema 4: Chat Inchado
**Sintoma:** Prompt muito grande, erros ortográficos

**Solução:**
- Simplificar system prompt
- Usar modelo gpt-4o-mini (mais rápido)
- Limitar tokens (max 800)
- Remover acentos para evitar encoding issues

### Problema 5: Security Definer Views
**Sintoma:** Warnings no Supabase sobre views

**Solução:** Remover views `calendar_with_client` e `backlog_with_client`

### Problema 6: Build - Instagram Icon
**Sintoma:** `Export Instagram doesn't exist`

**Solução:** Substituir `Instagram` por `AtSign` do lucide-react

---

## Guia de Instalação

### 1. Clone e Instalação
```bash
git clone https://github.com/performancedigital/socialmedia.git
cd socialmedia
npm install
```

### 2. Variáveis de Ambiente
Crie `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
GEMINI_API_KEY=sua-chave-gemini
OPENAI_API_KEY=sua-chave-openai
```

### 3. Configuração do Banco
1. Acesse https://app.supabase.com
2. Vá em SQL Editor
3. Cole o conteúdo de `supabase/migrations/001_multi_client_schema.sql`
4. Clique em Run
5. Verifique em Table Editor se as tabelas foram criadas

### 4. Verificação
Rode este SQL para confirmar:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'ai_personas', 'content_calendar', 'backlog_items');
```

Deve retornar 4 linhas.

### 5. Rodar Local
```bash
npm run dev
```

### 6. Deploy
```bash
vercel --prod
```

---

## Estrutura de Arquivos

```
socialmedia/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── backlog/generate/route.ts
│   │   │   ├── calendar/generate/route.ts
│   │   │   ├── chat/route.ts
│   │   │   ├── generate/route.ts
│   │   │   └── image/route.ts
│   │   ├── backlog/page.tsx
│   │   ├── clients/
│   │   │   ├── new/page.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ChatPanel.tsx
│   │   │   └── ClientSelector.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── personas.ts
│   │   │   └── service.ts
│   │   ├── auth-context.tsx
│   │   ├── client-context.tsx
│   │   └── supabase.ts
│   └── types/
│       ├── calendar.ts
│       ├── client.ts
│       └── content.ts
├── supabase/
│   └── migrations/
│       ├── 001_multi_client_schema.sql
│       └── verify_tables.sql
├── DOCUMENTATION.md
├── USER_GUIDE.md
├── TROUBLESHOOTING.md
└── README.md
```

---

## APIs e Endpoints

### POST /api/calendar/generate
Gera calendário editorial completo.

**Request:**
```json
{
  "client_id": "uuid",
  "month": 1,
  "year": 2024,
  "constraints": {
    "stories_per_day": 3,
    "reels_per_week": 3,
    "feeds_per_week": 2,
    "funnel_distribution": {
      "atencao": 40,
      "interesse": 30,
      "desejo": 20,
      "acao": 10
    }
  }
}
```

### POST /api/backlog/generate
Gera conteúdo a partir de item do backlog.

**Request:**
```json
{
  "client_id": "uuid",
  "backlog_id": "uuid"
}
```

### POST /api/chat
Chat com IA especialista.

**Request:**
```json
{
  "messages": [{"role": "user", "content": "..."}],
  "clientId": "uuid"
}
```

---

## Modelo de Dados

### clients
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK auth.users |
| name | TEXT | Nome do cliente |
| instagram_handle | TEXT | @instagram |
| niche | TEXT | Nicho/segmento |
| brand_colors | JSONB | {primary, secondary, accent} |
| voice_tone | TEXT | Tom de voz |
| target_audience | TEXT | Público-alvo |
| content_pillars | JSONB | Array de pilares |

### ai_personas
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| client_id | UUID | FK clients |
| system_prompt | TEXT | Prompt de sistema |
| niche_expertise | TEXT | Especialidade |
| model_preference | TEXT | gemini/openai |
| temperature | DECIMAL | 0-1 |

### content_calendar
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| client_id | UUID | FK clients |
| content_type | ENUM | feed_static, feed_carousel, etc |
| funnel_stage | ENUM | atencao, interesse, desejo, acao |
| title | TEXT | Título |
| copy | TEXT | Legenda |
| status | ENUM | rascunho, agendado, publicado |

### backlog_items
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| client_id | UUID | FK clients |
| title | TEXT | Título |
| priority | ENUM | baixa, media, alta, urgente |
| status | ENUM | pendente, em_producao, pronto |

---

## Sistema de IA

### Personas por Nicho

```typescript
const DEFAULT_PERSONAS = {
  ecommerce: {
    system_prompt: "Você é especialista em marketing digital para e-commerce...",
    temperature: 0.7
  },
  saude: {
    system_prompt: "Você é especialista em marketing para saúde e bem-estar...",
    temperature: 0.6
  },
  // ... outros nichos
}
```

### Chain de Prompts

1. **System Prompt** (da persona)
2. **Contexto do Cliente** (nome, nicho, tom, público)
3. **Tarefa** (gerar calendário, backlog, etc)
4. **Constraints** (frequência, funil)
5. **Output Format** (JSON estruturado)

### Fallback
```
Primário: Google Gemini 1.5 Flash
↓ (se falhar)
Secundário: OpenAI GPT-4o
```

---

## Deploy e Manutenção

### Deploy na Vercel
1. Conecte o repo GitHub
2. Configure as env vars
3. Deploy automático a cada push

### Comandos Úteis
```bash
# Build local
npm run build

# Verificar erros de tipo
npx tsc --noEmit

# Lint
npm run lint
```

### Monitoramento
- Vercel Dashboard: Logs de funções
- Supabase Dashboard: Logs de queries
- Console do navegador: Erros de cliente

---

## Checklist de Funcionamento

- [ ] SQL executado no Supabase
- [ ] Tabelas criadas (4 tabelas)
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] Login funciona
- [ ] Cliente pode ser criado
- [ ] Backlog funciona
- [ ] Chat responde
- [ ] Calendário gera conteúdo

---

## Links Importantes

- **Produção:** https://socialmedia-two-lac.vercel.app
- **Repo:** https://github.com/performancedigital/socialmedia
- **Supabase:** https://app.supabase.com

---

**Última atualização:** 23/04/2026
**Versão:** 0.2.0
**Status:** Em produção
