-- SQL para criar as tabelas do sistema multi-cliente
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- TABELA: clients
-- Armazena os clientes de cada usuário
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    instagram_handle TEXT,
    niche TEXT NOT NULL DEFAULT 'outro',
    brand_colors JSONB DEFAULT '{"primary": "#000000", "secondary": "#ffffff"}'::jsonb,
    logo_url TEXT,
    voice_tone TEXT DEFAULT 'profissional',
    target_audience TEXT,
    content_pillars JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_niche ON clients(niche);

-- Políticas RLS para clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios clientes"
    ON clients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar clientes"
    ON clients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus clientes"
    ON clients FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus clientes"
    ON clients FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- TABELA: ai_personas
-- Armazena as personas de IA customizadas por cliente
-- ============================================
CREATE TABLE IF NOT EXISTS ai_personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    system_prompt TEXT NOT NULL,
    niche_expertise TEXT NOT NULL,
    examples JSONB DEFAULT '{"good_examples": [], "bad_examples": []}'::jsonb,
    model_preference TEXT DEFAULT 'gemini' CHECK (model_preference IN ('gemini', 'openai')),
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 1),
    max_tokens INTEGER DEFAULT 2000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para ai_personas
CREATE INDEX IF NOT EXISTS idx_ai_personas_client_id ON ai_personas(client_id);

-- Políticas RLS para ai_personas
ALTER TABLE ai_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver personas de seus clientes"
    ON ai_personas FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = ai_personas.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar personas para seus clientes"
    ON ai_personas FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = ai_personas.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar personas de seus clientes"
    ON ai_personas FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = ai_personas.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem deletar personas de seus clientes"
    ON ai_personas FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = ai_personas.client_id 
            AND clients.user_id = auth.uid()
        )
    );

-- ============================================
-- TABELA: content_calendar
-- Armazena os itens do calendário editorial
-- ============================================
CREATE TABLE IF NOT EXISTS content_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN (
        'feed_static', 'feed_carousel', 'feed_reel', 
        'story_single', 'story_sequence', 'story_poll', 'story_question', 'story_quiz'
    )),
    funnel_stage TEXT NOT NULL CHECK (funnel_stage IN ('atencao', 'interesse', 'desejo', 'acao')),
    title TEXT,
    copy TEXT,
    hashtags TEXT,
    visual_prompt TEXT,
    image_url TEXT,
    scheduled_date DATE,
    scheduled_time TIME,
    status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'agendado', 'publicado', 'arquivado')),
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para content_calendar
CREATE INDEX IF NOT EXISTS idx_content_calendar_client_id ON content_calendar(client_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_date ON content_calendar(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_funnel ON content_calendar(funnel_stage);

-- Políticas RLS para content_calendar
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver calendário de seus clientes"
    ON content_calendar FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = content_calendar.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar itens no calendário de seus clientes"
    ON content_calendar FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = content_calendar.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar calendário de seus clientes"
    ON content_calendar FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = content_calendar.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem deletar itens do calendário de seus clientes"
    ON content_calendar FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = content_calendar.client_id 
            AND clients.user_id = auth.uid()
        )
    );

-- ============================================
-- TABELA: backlog_items
-- Armazena posts pendentes/backlog
-- ============================================
CREATE TABLE IF NOT EXISTS backlog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    suggested_funnel_stage TEXT CHECK (suggested_funnel_stage IN ('atencao', 'interesse', 'desejo', 'acao')),
    suggested_content_type TEXT CHECK (suggested_content_type IN (
        'feed_static', 'feed_carousel', 'feed_reel', 
        'story_single', 'story_sequence', 'story_poll', 'story_question', 'story_quiz'
    )),
    priority TEXT DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_producao', 'pronto', 'agendado')),
    theme_ideas JSONB DEFAULT '[]'::jsonb,
    reference_links JSONB DEFAULT '[]'::jsonb,
    scheduled_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para backlog_items
CREATE INDEX IF NOT EXISTS idx_backlog_client_id ON backlog_items(client_id);
CREATE INDEX IF NOT EXISTS idx_backlog_status ON backlog_items(status);
CREATE INDEX IF NOT EXISTS idx_backlog_priority ON backlog_items(priority);

-- Políticas RLS para backlog_items
ALTER TABLE backlog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver backlog de seus clientes"
    ON backlog_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = backlog_items.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar itens no backlog de seus clientes"
    ON backlog_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = backlog_items.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar backlog de seus clientes"
    ON backlog_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = backlog_items.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem deletar itens do backlog de seus clientes"
    ON backlog_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = backlog_items.client_id 
            AND clients.user_id = auth.uid()
        )
    );

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_personas_updated_at BEFORE UPDATE ON ai_personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON content_calendar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backlog_items_updated_at BEFORE UPDATE ON backlog_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEW: calendar_with_client
-- Facilita consultas ao calendário com dados do cliente
-- ============================================
CREATE OR REPLACE VIEW calendar_with_client AS
SELECT 
    cc.*,
    c.name as client_name,
    c.instagram_handle,
    c.niche,
    c.user_id
FROM content_calendar cc
JOIN clients c ON cc.client_id = c.id;

-- ============================================
-- VIEW: backlog_with_client
-- Facilita consultas ao backlog com dados do cliente
-- ============================================
CREATE OR REPLACE VIEW backlog_with_client AS
SELECT 
    bi.*,
    c.name as client_name,
    c.instagram_handle,
    c.niche,
    c.user_id
FROM backlog_items bi
JOIN clients c ON bi.client_id = c.id;
