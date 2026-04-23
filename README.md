# Performance Social Media - SaaS Estratégico

O **Performance Social Media** é uma plataforma avançada para gestores de redes sociais e agências, focada na geração automatizada de conteúdo estratégico de alta performance para Instagram.

## Novidades v0.2.0 - Sistema Multi-Cliente

- **Multi-Cliente**: Gerencie vários clientes de forma isolada
- **IA por Nicho**: Personas de IA especializadas (e-commerce, saúde, beleza, etc.)
- **Calendário Editorial**: Geração automática com frequências configuráveis
- **Funil de Conteúdo**: Distribuição automática (Atenção → Interesse → Desejo → Ação)
- **Backlog**: Gestão de posts pendentes e atrasados
- **Fallback de IA**: Gemini + OpenAI para máxima confiabilidade

## 🚀 Funcionalidades

- **Gerador de Cronograma 30 Dias:** Cria uma estratégia completa baseada em pilares de conteúdo (Autoridade, Conexão e Venda).
- **Estrategista IA (Chat):** Assistente inteligente que analisa o perfil do cliente e sugere temas e nichos.
- **Geração de Imagens (DALL-E 3):** Criação de imagens ultra-realistas diretamente da plataforma a partir dos prompts gerados.
- **Exportação CSV:** Download dos cronogramas para uso externo (Excel, Notion, Canva).
- **Multi-Modelo:** Sistema inteligente com fallback automático entre Google Gemini e OpenAI.
- **Multi-Cliente:** Gestão de múltiplos clientes com dados isolados.
- **Backlog:** Sistema para gerenciar posts pendentes e atrasados.

## 🛠️ Stack Tecnológica

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4.
- **UI/UX:** Framer Motion, Lucide React, Glassmorphism Design.
- **Backend:** Next.js API Routes.
- **IA:** Google Gemini Flash, OpenAI GPT-4o, DALL-E 3.
- **Persistência:** Supabase.

## 📚 Documentação

- [Documentação Técnica Completa](./DOCUMENTATION.md)
- [Guia do Usuário](./USER_GUIDE.md)
- [Schema do Banco de Dados](./supabase/migrations/001_multi_client_schema.sql)

## ⚙️ Configuração (Environment Variables)

Para rodar o projeto, configure o arquivo `.env.local`:

```bash
GEMINI_API_KEY=sua_chave_aqui
OPENAI_API_KEY=sua_chave_aqui
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 📦 Instalação

```bash
npm install
npm run dev
```

## 🗄️ Setup do Banco de Dados

1. Acesse o SQL Editor do Supabase
2. Execute o arquivo: `supabase/migrations/001_multi_client_schema.sql`
3. Verifique se as tabelas foram criadas:
   - `clients`
   - `ai_personas`
   - `content_calendar`
   - `backlog_items`

## 🚢 Deploy

O projeto está configurado para deploy automático na **Vercel** via GitHub.
Produção: [socialmedia-two-lac.vercel.app](https://socialmedia-two-lac.vercel.app)

## 📊 Frequências Suportadas

| Tipo | Frequência | Mensal (~) |
|------|------------|------------|
| Stories | 3 por dia | 90 |
| Reels | 3 por semana | 12 |
| Feeds | 2 por semana | 8 |

## 🎯 Nichos Suportados

- E-commerce
- Serviços
- Educação
- Saúde
- Beleza
- Moda
- Alimentação
- Tecnologia
- Imobiliário
- Fitness
- Outro (genérico)

---

Desenvolvido por Performance Digital
