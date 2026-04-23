# Troubleshooting - Erros Comuns

## 1. Erro ao Criar Cliente

### Sintoma
Ao tentar criar um cliente, nada acontece ou aparece "Erro ao criar cliente".

### Causas e Soluções

#### A) Tabelas do Banco Não Criadas
**Verificação:**
1. Acesse o Supabase Table Editor
2. Veja se as tabelas existem: `clients`, `ai_personas`, etc.

**Solução:**
Execute o SQL de migração: `supabase/migrations/001_multi_client_schema.sql`

Veja o guia completo: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

---

#### B) Erro de Permissão (RLS)
**Sintoma:** Erro 403 ou "permission denied"

**Solução:**
O SQL de migração já inclui as políticas RLS. Se o erro persistir:

1. No Supabase, vá em Authentication > Policies
2. Verifique se as tabelas têm as políticas:
   - "Usuários podem ver seus próprios clientes"
   - "Usuários podem criar clientes"

---

#### C) Campos Obrigatórios Vazios
**Verificação:**
- Nome do cliente está preenchido?
- Nicho foi selecionado?

**Solução:**
Preencha todos os campos obrigatórios (marcados com *)

---

#### D) Erro de Conexão com Supabase
**Sintoma:** "Failed to fetch" ou timeout

**Verificação:**
Verifique se as variáveis de ambiente estão configuradas:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave
```

---

## 2. Chat Não Funciona

### Problema: Chat Fica em Branco ou Não Responde

#### Solução 1: Selecione um Cliente
O chat agora requer um cliente ativo. Selecione um cliente no dropdown superior.

#### Solução 2: API Key da OpenAI
Verifique se a variável `OPENAI_API_KEY` está configurada no Vercel.

#### Solução 3: Limpar Cache
1. Feche o chat
2. Recarregue a página (F5)
3. Abra o chat novamente

---

## 3. Como Executar o SQL no Supabase

### Passo a Passo Visual

```
┌─────────────────────────────────────────┐
│  1. Acesse app.supabase.com             │
│     Faça login                          │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  2. Clique no seu projeto               │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  3. Menu lateral → SQL Editor           │
│     (icone de terminal)                 │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  4. Clique em "New query"               │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  5. Abra o arquivo:                     │
│     supabase/migrations/                │
│     001_multi_client_schema.sql         │
│                                         │
│     Copie TODO o conteúdo               │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  6. Cole no editor SQL do Supabase      │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  7. Clique em "Run" (botão verde)       │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  8. Verifique: Menu → Table Editor      │
│     Deve aparecer:                      │
│     ✓ clients                           │
│     ✓ ai_personas                       │
│     ✓ content_calendar                  │
│     ✓ backlog_items                     │
└─────────────────────────────────────────┘
```

---

## 4. Erros de Build/Deploy

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Type error"
Verifique se todos os tipos estão importados corretamente.

### Erro: "Instagram icon not found"
O ícone `Instagram` não existe no lucide-react. Use `AtSign` (@) no lugar.

---

## 5. Verificação Rápida (Checklist)

Antes de usar o sistema, verifique:

- [ ] SQL executado no Supabase
- [ ] Tabelas criadas (clients, ai_personas, content_calendar, backlog_items)
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy realizado com sucesso
- [ ] Usuário logado no sistema

---

## Precisa de Mais Ajuda?

1. Verifique o console do navegador (F12 > Console) por erros
2. Verifique os logs do Vercel (Deploy > Functions)
3. Verifique o logs do Supabase (Database > Logs)
