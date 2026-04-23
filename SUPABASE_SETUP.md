# Como Executar o SQL no Supabase

## Passo a Passo com Imagens

### 1. Acesse o Dashboard do Supabase

Vá para: https://app.supabase.com

Faça login com sua conta.

---

### 2. Selecione seu Projeto

Clique no projeto que você criou para o Performance Social Media.

---

### 3. Abra o SQL Editor

No menu lateral esquerdo, clique em **"SQL Editor"** (ícone de terminal/código).

```
Menu Lateral:
├── Home
├── Table Editor
├── SQL Editor  <- CLIQUE AQUI
├── Database
└── ...
```

---

### 4. Crie uma Nova Query

Clique no botão **"New query"** ou **"+ New query"** no canto superior direito.

---

### 5. Cole o Código SQL

Abra o arquivo local: `supabase/migrations/001_multi_client_schema.sql`

Copie TODO o conteúdo do arquivo.

Cole no editor SQL do Supabase.

---

### 6. Execute o SQL

Clique no botão **"Run"** ou **"Execute"** (geralmente verde).

Aguarde a execução completar.

---

### 7. Verifique se Funcionou

Clique em **"Table Editor"** no menu lateral.

Você deve ver estas tabelas criadas:
- `clients`
- `ai_personas`
- `content_calendar`
- `backlog_items`

Se aparecerem, está tudo certo! ✅

---

## Vídeo Rápido (Texto)

```
1. Dashboard Supabase
   └─► SQL Editor
       └─► New Query
           └─► Cole o SQL
               └─► Run
                   └─► Verifique Table Editor
```

---

## Erros Comuns

### "Error: relation already exists"
**Significado:** A tabela já existe.
**Solução:** Pode ignorar, ou delete as tabelas existentes antes.

### "Error: permission denied"
**Significado:** Sem permissão.
**Solução:** Verifique se você é o dono do projeto Supabase.

### "Error: syntax error"
**Significado:** SQL copiado incorretamente.
**Solução:** Copie o arquivo novamente, certifique-se de pegar todo o conteúdo.

---

## Precisa de Ajuda?

Se não conseguir, me envie:
1. Screenshot do erro
2. Link do seu projeto Supabase
