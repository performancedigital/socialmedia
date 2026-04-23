# CHANGELOG - Performance Social Media

## [0.2.0] - 2023-04-23

### Adicionado
- Sistema multi-cliente completo
- Cadastro de clientes com 3 etapas (básico, visual, estratégia)
- Personas de IA customizáveis por nicho (10 nichos suportados)
- Backlog para gestão de posts pendentes
- Calendário editorial com funil de conteúdo
- Seletor de cliente no header
- API de calendário (/api/calendar/generate)
- API de backlog (/api/backlog/generate)
- Contexto de cliente (ClientProvider)
- Tipos TypeScript para cliente, conteúdo e calendário

### Modificado
- ChatPanel otimizado (prompt simplificado, modelo mais rápido)
- README atualizado com novas funcionalidades
- SQL de migração com tratamento de erros

### Corrigido
- Erro de encoding no ChatPanel
- Erro "Instagram icon not found" (substituído por AtSign)
- SQL policy already exists (adicionado EXCEPTION handling)
- SQL syntax error (removido caractere inválido)
- Security definer views (removidas views problemáticas)

### Documentação
- DOCUMENTATION.md (técnica)
- USER_GUIDE.md (usuário)
- TROUBLESHOOTING.md (problemas comuns)
- SUPABASE_SETUP.md (setup do banco)
- DOCUMENTATION_COMPLETE.md (documentação completa)
- CHANGELOG.md (este arquivo)

---

## [0.1.0] - 2023-04-22

### Adicionado
- Sistema básico de autenticação
- Geração de cronograma 30 dias
- Chat com IA (OpenAI)
- Geração de imagens (DALL-E)
- Exportação CSV
- Fallback Gemini/OpenAI

---

## Commits

```
baa2cf9 fix: fix SQL syntax error and remove security definer views
8a2cab2 fix: update SQL migration to handle duplicate policies gracefully
7ad4c8c docs: add troubleshooting guide
28a53ed fix: optimize chat panel and add setup guide
cdb4a96 docs: add comprehensive documentation and user guide
016fb62 feat: implement multi-client system with AI personas
```
