-- SQL para criar as tabelas do sistema multi-cliente
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- TABELA: clients
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

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_niche ON clients(niche);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem ver seus proprios clientes"
        ON clients FOR SELECT
        USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem criar clientes"
        ON clients FOR INSERT
        WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem atualizar seus clientes"
        ON clients FOR UPDATE
        USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem deletar seus clientes"
        ON clients FOR DELETE
        USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

-- ============================================
-- TABELA: ai_personas
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

CREATE INDEX IF NOT EXISTS idx_ai_personas_client_id ON ai_personas(client_id);

ALTER TABLE ai_personas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem ver personas de seus clientes"
        ON ai_personas FOR SELECT
        USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = ai_personas.client_id AND clients.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem criar personas para seus clientes"
        ON ai_personas FOR INSERT
        WITH CHECK (EXISTS (SELECT 1 FROM clients WHERE clients.id = ai_personas.client_id AND clients.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem atualizar personas de seus clientes"
        ON ai_personas FOR UPDATE
        USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = ai_personas.client_id AND clients.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem deletar personas de seus clientes"
        ON ai_personas FOR DELETE
        USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = ai_personas.client_id AND clients.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

-- ============================================
-- TABELA: content_calendar
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

CREATE INDEX IF NOT EXISTS idx_content_calendar_client_id ON content_calendar(client_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_date ON content_calendar(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_funnel ON content_calendar(funnel_stage);

ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem ver calendario de seus clientes"
        ON content_calendar FOR SELECT
        USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = content_calendar.client_id AND clients.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem criar itens no calendario de seus clientes"
        ON content_calendar FOR INSERT
        WITH CHECK (EXISTS (SELECT 1 FROM clients WHERE clients.id = content_calendar.client_id AND clients.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem atualizar calendario de seus clientes"
        ON content_calendar FOR UPDATE
        USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = content_calendar.client_id AND clients.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem deletar itens do calendario de seus clientes"
        ON content_calendar FOR DELETE
        USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = content_calendar.client_id AND clients.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

-- ============================================
-- TABELA: backlog_items
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

CREATE INDEX IF NOT EXISTS idx_backlog_client_id ON backlog_items(client_id);
CREATE INDEX IF NOT EXISTS idx_backlog_status ON backlog_items(status);
CREATE INDEX IF NOT EXISTS idx_backlog_priority ON backlog_items(priority);

ALTER TABLE backlog_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem ver backlog de seus clientes"
        ON backlog_items FOR SELECT
        USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = backlog_items.client_id AND clients.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem criar itens no backlog de seus clientes"
        ON backlog_items FOR INSERT
        WITH CHECK (EXISTS (SELECT 1 FROM clients WHERE clients.id = backlog_items.client_id AND clients.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem atualizar backlog de seus clientes"
        ON backlog_items FOR UPDATE
        USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = backlog_items.client_id AND clients.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem deletar itens do backlog de seus clientes"
        ON backlog_items FOR DELETE
        USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = backlog_items.client_id AND clients.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

-- ============================================
-- FUNCOES E TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Trigger ja existe';
END $$;

DO $$
BEGIN
    CREATE TRIGGER update_ai_personas_updated_at BEFORE UPDATE ON ai_personas
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Trigger ja existe';
END $$;

DO $$
BEGIN
    CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON content_calendar
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Trigger ja existe';
END $$;

DO $$
BEGIN
    CREATE TRIGGER update_backlog_items_updated_at BEFORE UPDATE ON backlog_items
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Trigger ja existe';
END $$;

-- ============================================
-- VIEWS (sem SECURITY DEFINER para evitar warnings)
-- ============================================

DROP VIEW IF EXISTS calendar_with_client;
DROP VIEW IF EXISTS backlog_with_client;

-- Nao criamos views com security definer para evitar os warnings
-- As queries podem ser feitas diretamente nas tabelas com JOIN

-- ============================================
-- TABELA: profiles (extensão do auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem ver seu proprio perfil"
        ON profiles FOR SELECT
        USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem atualizar seu proprio perfil"
        ON profiles FOR UPDATE
        USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Trigger ja existe';
END $$;

DO $$
BEGIN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Trigger ja existe';
END $$;

-- ============================================
-- TABELA: projects (projetos/histórico)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    instagram TEXT,
    theme TEXT,
    target_audience TEXT,
    days INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem ver seus proprios projetos"
        ON projects FOR SELECT
        USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem criar projetos"
        ON projects FOR INSERT
        WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem deletar seus proprios projetos"
        ON projects FOR DELETE
        USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Trigger ja existe';
END $$;

-- ============================================
-- TABELA: content_generations (gerações de conteúdo)
-- ============================================
CREATE TABLE IF NOT EXISTS content_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_generations_project_id ON content_generations(project_id);
CREATE INDEX IF NOT EXISTS idx_content_generations_user_id ON content_generations(user_id);

ALTER TABLE content_generations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem ver suas proprias geracoes"
        ON content_generations FOR SELECT
        USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;

DO $$
BEGIN
    CREATE POLICY "Usuarios podem criar geracoes"
        ON content_generations FOR INSERT
        WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy ja existe';
END $$;
