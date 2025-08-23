-- 🚀 TORRE SUPREMA CLOUD SCHEMA - SUPABASE
-- Sistema de contexto otimizado para Supabase PostgreSQL

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- ================================
-- CONTEXTO GLOBAL DA TORRE SUPREMA
-- ================================

CREATE TABLE torre_suprema_context (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Estado atual
    current_status VARCHAR(100) DEFAULT 'active',
    current_project VARCHAR(255),
    current_task TEXT,
    current_phase VARCHAR(100),
    
    -- Contexto da conversa
    conversation_history JSONB DEFAULT '[]'::jsonb,
    user_intent TEXT,
    user_preferences JSONB DEFAULT '{}'::jsonb,
    
    -- Projetos e conhecimento
    active_projects JSONB DEFAULT '[]'::jsonb,
    completed_projects JSONB DEFAULT '[]'::jsonb,
    learned_patterns JSONB DEFAULT '[]'::jsonb,
    
    -- Métricas
    tasks_completed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 1.0000,
    user_satisfaction_score DECIMAL(3,2) DEFAULT 5.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE torre_suprema_context ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own context" ON torre_suprema_context
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own context" ON torre_suprema_context
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own context" ON torre_suprema_context
    FOR UPDATE USING (auth.uid() = user_id);

-- ================================
-- CONVERSAS E MENSAGENS
-- ================================

CREATE TABLE conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES torre_suprema_context(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    message_sequence INTEGER NOT NULL,
    user_message TEXT,
    torre_response TEXT,
    message_type VARCHAR(50),
    intent_detected VARCHAR(100),
    sentiment VARCHAR(20),
    
    actions_taken JSONB DEFAULT '[]'::jsonb,
    tools_used JSONB DEFAULT '[]'::jsonb,
    outcome VARCHAR(100),
    execution_time INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON conversation_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON conversation_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================
-- PROJETOS
-- ================================

CREATE TABLE torre_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES torre_suprema_context(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'planning',
    
    tech_stack JSONB DEFAULT '[]'::jsonb,
    architecture_pattern VARCHAR(100),
    
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    tasks_total INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    
    repository_url VARCHAR(500),
    deployment_urls JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE torre_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects" ON torre_projects
    FOR ALL USING (auth.uid() = user_id);

-- ================================
-- TASKS E WORKFLOWS
-- ================================

CREATE TABLE torre_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES torre_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES torre_tasks(id),
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'pending',
    assigned_agent VARCHAR(100),
    
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    actual_duration INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE torre_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks" ON torre_tasks
    FOR ALL USING (auth.uid() = user_id);

-- ================================
-- KNOWLEDGE BASE
-- ================================

CREATE TABLE torre_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES torre_suprema_context(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    category VARCHAR(100) NOT NULL,
    domain VARCHAR(100),
    technology VARCHAR(100),
    
    title VARCHAR(255) NOT NULL,
    problem_description TEXT,
    solution_description TEXT NOT NULL,
    code_examples JSONB DEFAULT '[]'::jsonb,
    
    confidence_score DECIMAL(3,2) DEFAULT 0.50,
    usage_count INTEGER DEFAULT 0,
    
    tags JSONB DEFAULT '[]'::jsonb,
    search_vector tsvector,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE torre_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own knowledge" ON torre_knowledge
    FOR ALL USING (auth.uid() = user_id);

-- Search index
CREATE INDEX idx_knowledge_search ON torre_knowledge USING GIN (search_vector);

-- ================================
-- AGENTES E PERFORMANCE
-- ================================

CREATE TABLE torre_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES torre_suprema_context(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    agent_name VARCHAR(100) NOT NULL,
    agent_type VARCHAR(100) NOT NULL,
    skills JSONB DEFAULT '[]'::jsonb,
    
    status VARCHAR(50) DEFAULT 'idle',
    tasks_completed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 1.0000,
    average_completion_time INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE torre_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own agents" ON torre_agents
    FOR ALL USING (auth.uid() = user_id);

-- ================================
-- TRIGGERS E FUNCTIONS
-- ================================

-- Function para update automático de timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_context_updated_at BEFORE UPDATE ON torre_suprema_context FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON torre_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON torre_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_updated_at BEFORE UPDATE ON torre_knowledge FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON torre_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function para search vector
CREATE OR REPLACE FUNCTION update_knowledge_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('portuguese', 
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.problem_description, '') || ' ' ||
        COALESCE(NEW.solution_description, '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_knowledge_search BEFORE INSERT OR UPDATE ON torre_knowledge FOR EACH ROW EXECUTE FUNCTION update_knowledge_search_vector();

-- ================================
-- REAL-TIME SUBSCRIPTIONS
-- ================================

-- Enable realtime para todas as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE torre_suprema_context;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE torre_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE torre_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE torre_knowledge;
ALTER PUBLICATION supabase_realtime ADD TABLE torre_agents;

-- ================================
-- VIEWS OTIMIZADAS
-- ================================

-- Dashboard view
CREATE VIEW dashboard_overview AS
SELECT 
    c.id as context_id,
    c.user_id,
    c.current_status,
    c.current_project,
    c.tasks_completed,
    c.success_rate,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT k.id) as total_knowledge,
    COUNT(DISTINCT a.id) as total_agents
FROM torre_suprema_context c
LEFT JOIN torre_projects p ON c.id = p.context_id
LEFT JOIN torre_tasks t ON p.id = t.project_id
LEFT JOIN torre_knowledge k ON c.id = k.context_id
LEFT JOIN torre_agents a ON c.id = a.context_id
GROUP BY c.id;

-- Project stats view
CREATE VIEW project_stats AS
SELECT 
    p.*,
    COUNT(t.id) as task_count,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    AVG(t.progress_percentage) as avg_progress
FROM torre_projects p
LEFT JOIN torre_tasks t ON p.id = t.project_id
GROUP BY p.id;

-- ================================
-- FUNCTIONS PARA API
-- ================================

-- Function para criar contexto inicial
CREATE OR REPLACE FUNCTION create_initial_context()
RETURNS torre_suprema_context AS $$
DECLARE
    new_context torre_suprema_context;
    session_id_val VARCHAR(255);
BEGIN
    session_id_val := 'session-' || auth.uid()::text || '-' || extract(epoch from now())::text;
    
    INSERT INTO torre_suprema_context (
        user_id,
        session_id,
        current_status,
        current_task,
        user_preferences
    ) VALUES (
        auth.uid(),
        session_id_val,
        'initializing',
        'Configurando Torre Suprema Cloud',
        '{"theme": "dark", "language": "pt-BR", "notifications": true}'::jsonb
    ) RETURNING * INTO new_context;
    
    RETURN new_context;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function para buscar conhecimento
CREATE OR REPLACE FUNCTION search_knowledge(
    search_query TEXT,
    category_filter TEXT DEFAULT NULL,
    limit_results INTEGER DEFAULT 20
)
RETURNS SETOF torre_knowledge AS $$
BEGIN
    RETURN QUERY
    SELECT k.*
    FROM torre_knowledge k
    WHERE k.user_id = auth.uid()
      AND (category_filter IS NULL OR k.category = category_filter)
      AND (
        k.search_vector @@ plainto_tsquery('portuguese', search_query)
        OR k.tags @> jsonb_build_array(search_query)
      )
    ORDER BY 
      ts_rank(k.search_vector, plainto_tsquery('portuguese', search_query)) DESC,
      k.confidence_score DESC,
      k.usage_count DESC
    LIMIT limit_results;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- ================================
-- DADOS INICIAIS
-- ================================

-- Inserir dados de exemplo (será executado após auth)
-- Isso será feito via API no primeiro login

COMMENT ON SCHEMA public IS 'Torre Suprema Cloud Database - Supabase Optimized Schema';