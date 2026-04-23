# Performance Social Media

## Plataforma SaaS para Gestão de Múltiplos Clientes e Geração de Conteúdo com IA

[![Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://socialmedia-two-lac.vercel.app)
[![Version](https://img.shields.io/badge/version-0.2.0-blue)](./CHANGELOG.md)

---

## Funcionalidades

- **Multi-Cliente**: Gestão isolada de vários clientes
- **IA por Nicho**: Personas especializadas (e-commerce, saúde, beleza, etc.)
- **Calendário Editorial**: Geração automática com frequências configuráveis
- **Funil de Conteúdo**: Distribuição automática (Atenção → Interesse → Desejo → Ação)
- **Backlog**: Gestão de posts pendentes e atrasados
- **Fallback de IA**: Gemini + OpenAI

---

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [DOCUMENTATION_COMPLETE.md](./DOCUMENTATION_COMPLETE.md) | Documentação técnica completa |
| [USER_GUIDE.md](./USER_GUIDE.md) | Guia do usuário |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Problemas comuns e soluções |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Como configurar o banco de dados |
| [CHANGELOG.md](./CHANGELOG.md) | Histórico de versões |

---

## Setup Rápido

### 1. Clone
```bash
git clone https://github.com/performancedigital/socialmedia.git
```

### 2. Instale
```bash
cd socialmedia
npm install
```

### 3. Configure
Crie `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
GEMINI_API_KEY=sua_chave
OPENAI_API_KEY=sua_chave
```

### 4. Banco de Dados
Execute no Supabase SQL Editor:
- `supabase/migrations/001_multi_client_schema.sql`

### 5. Rode
```bash
npm run dev
```

---

## Deploy

Deploy automático na Vercel: https://socialmedia-two-lac.vercel.app

---

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS + Framer Motion
- Supabase (PostgreSQL + Auth)
- Google Gemini + OpenAI

---

## Licença

Proprietário - Performance Digital
