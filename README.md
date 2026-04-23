# Performance Social Media - SaaS Estratégico

O **Performance Social Media** é uma plataforma avançada para gestores de redes sociais e agências, focada na geração automatizada de conteúdo estratégico de alta performance para Instagram.

## 🚀 Funcionalidades

- **Gerador de Cronograma 30 Dias:** Cria uma estratégia completa baseada em pilares de conteúdo (Autoridade, Conexão e Venda).
- **Estrategista IA (Chat):** Assistente inteligente que analisa o perfil do cliente e sugere temas e nichos.
- **Geração de Imagens (DALL-E 3):** Criação de imagens ultra-realistas diretamente da plataforma a partir dos prompts gerados.
- **Exportação CSV:** Download dos cronogramas para uso externo (Excel, Notion, Canva).
- **Multi-Modelo:** Sistema inteligente com fallback automático entre Google Gemini e OpenAI.

## 🛠️ Stack Tecnológica

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4.
- **UI/UX:** Framer Motion, Lucide React, Glassmorphism Design.
- **Backend:** Next.js API Routes.
- **IA:** Google Gemini Flash, OpenAI GPT-4o, DALL-E 3.
- **Persistência:** Supabase.

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

## 🚢 Deploy

O projeto está configurado para deploy automático na **Vercel** via GitHub.
Produção: [socialmedia-two-lac.vercel.app](https://socialmedia-two-lac.vercel.app)

