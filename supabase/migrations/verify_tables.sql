-- VERIFICACAO RAPIDA: Rode este SQL para confirmar se as tabelas foram criadas

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'clients') as clients_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'ai_personas') as personas_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'content_calendar') as calendar_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'backlog_items') as backlog_exists;

-- Se todos retornarem 1, as tabelas existem!
