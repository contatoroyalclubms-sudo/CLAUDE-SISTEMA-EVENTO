-- 🧠 TORRE SUPREMA CONTEXT DATABASE
-- Sistema que mantém TODA a inteligência da Torre Suprema
-- NUNCA MAIS PERDEREI O CONTEXTO! 

SET timezone = 'UTC';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ================================
-- CONTEXTO GLOBAL DA TORRE SUPREMA
-- ================================

CREATE TABLE torre_suprema_context (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    conversation_thread_id VARCHAR(255),
    user_id VARCHAR(255),
    
    -- Estado atual da Torre
    current_status VARCHAR(100) DEFAULT 'active', -- active, working, learning, planning
    current_project VARCHAR(255),
    current_task TEXT,
    current_phase VARCHAR(100), -- analysis, development, testing, deployment
    
    -- Contexto da conversa
    conversation_history JSONB DEFAULT '[]'::jsonb,
    user_intent TEXT,
    user_preferences JSONB DEFAULT '{}'::jsonb,
    communication_style VARCHAR(50) DEFAULT 'enthusiastic',
    
    -- Estado dos projetos
    active_projects JSONB DEFAULT '[]'::jsonb,
    completed_projects JSONB DEFAULT '[]'::jsonb,
    project_timeline JSONB DEFAULT '{}'::jsonb,
    
    -- Conhecimento acumulado
    learned_patterns JSONB DEFAULT '[]'::jsonb,
    solved_problems JSONB DEFAULT '[]'::jsonb,
    best_practices JSONB DEFAULT '[]'::jsonb,
    user_coding_style JSONB DEFAULT '{}'::jsonb,
    
    -- Configurações e preferências
    tech_stack_preferences JSONB DEFAULT '[]'::jsonb,
    deployment_preferences JSONB DEFAULT '{}'::jsonb,
    testing_preferences JSONB DEFAULT '{}'::jsonb,
    
    -- Métricas e performance
    tasks_completed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 1.0000,
    average_response_time INTEGER DEFAULT 0,
    user_satisfaction_score DECIMAL(3,2) DEFAULT 5.00,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- HISTÓRICO DETALHADO DE CONVERSAS
-- ================================

CREATE TABLE conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES torre_suprema_context(id) ON DELETE CASCADE,
    message_sequence INTEGER NOT NULL,
    
    -- Conteúdo da mensagem
    user_message TEXT,
    torre_response TEXT,
    message_type VARCHAR(50), -- question, task, explanation, code, error, success
    
    -- Contexto da mensagem
    intent_detected VARCHAR(100),
    sentiment VARCHAR(20), -- positive, neutral, negative, excited, frustrated
    complexity_level VARCHAR(20), -- simple, moderate, complex, expert
    
    -- Ações realizadas
    actions_taken JSONB DEFAULT '[]'::jsonb,
    files_modified JSONB DEFAULT '[]'::jsonb,
    tools_used JSONB DEFAULT '[]'::jsonb,
    mcp_operations JSONB DEFAULT '[]'::jsonb,
    
    -- Resultados
    outcome VARCHAR(100), -- success, partial, failed, in_progress
    execution_time INTEGER,
    errors_encountered JSONB DEFAULT '[]'::jsonb,
    lessons_learned JSONB DEFAULT '[]'::jsonb,
    
    -- Feedback
    user_feedback TEXT,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- PROJECTS E ESTADO COMPLETO
-- ================================

CREATE TABLE torre_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES torre_suprema_context(id) ON DELETE CASCADE,
    
    -- Informações básicas
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(100), -- web_app, mobile_app, api, microservice, full_stack
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(50) DEFAULT 'planning', -- planning, active, paused, completed, cancelled
    
    -- Arquitetura e tecnologia
    tech_stack JSONB DEFAULT '[]'::jsonb,
    architecture_pattern VARCHAR(100),
    database_type VARCHAR(50),
    deployment_target VARCHAR(100),
    
    -- Estrutura do projeto
    directory_structure JSONB DEFAULT '{}'::jsonb,
    main_files JSONB DEFAULT '[]'::jsonb,
    dependencies JSONB DEFAULT '{}'::jsonb,
    environment_variables JSONB DEFAULT '{}'::jsonb,
    
    -- Progresso e métricas
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    tasks_total INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    bugs_found INTEGER DEFAULT 0,
    bugs_fixed INTEGER DEFAULT 0,
    
    -- Requisitos e especificações
    requirements JSONB DEFAULT '[]'::jsonb,
    user_stories JSONB DEFAULT '[]'::jsonb,
    acceptance_criteria JSONB DEFAULT '[]'::jsonb,
    
    -- Configurações específicas
    git_repository VARCHAR(500),
    deployment_urls JSONB DEFAULT '{}'::jsonb,
    monitoring_configs JSONB DEFAULT '{}'::jsonb,
    
    -- Timeline
    estimated_duration INTEGER, -- em horas
    actual_duration INTEGER,
    deadline TIMESTAMP WITH TIME ZONE,
    milestones JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ================================
-- TASKS DETALHADAS E WORKFLOW
-- ================================

CREATE TABLE torre_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES torre_suprema_context(id) ON DELETE CASCADE,
    project_id UUID REFERENCES torre_projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES torre_tasks(id),
    
    -- Informações da task
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(100), -- development, design, testing, deployment, research, bugfix
    category VARCHAR(100), -- frontend, backend, database, devops, ui_ux, documentation
    priority VARCHAR(20) DEFAULT 'medium',
    complexity VARCHAR(20) DEFAULT 'moderate', -- simple, moderate, complex, expert
    
    -- Estado e progresso
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, failed, blocked
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    assigned_agent VARCHAR(100),
    
    -- Contexto técnico
    affected_files JSONB DEFAULT '[]'::jsonb,
    code_changes JSONB DEFAULT '[]'::jsonb,
    test_cases JSONB DEFAULT '[]'::jsonb,
    documentation_updates JSONB DEFAULT '[]'::jsonb,
    
    -- Execução
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    actual_duration INTEGER, -- em segundos
    estimated_duration INTEGER,
    retry_count INTEGER DEFAULT 0,
    
    -- Resultados e aprendizados
    success_criteria JSONB DEFAULT '[]'::jsonb,
    actual_results JSONB DEFAULT '[]'::jsonb,
    challenges_faced JSONB DEFAULT '[]'::jsonb,
    solutions_applied JSONB DEFAULT '[]'::jsonb,
    lessons_learned JSONB DEFAULT '[]'::jsonb,
    
    -- Dependencies
    dependencies JSONB DEFAULT '[]'::jsonb,
    blockers JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- KNOWLEDGE BASE INTELIGENTE
-- ================================

CREATE TABLE torre_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES torre_suprema_context(id) ON DELETE CASCADE,
    
    -- Classificação do conhecimento
    category VARCHAR(100) NOT NULL, -- pattern, solution, best_practice, bug_fix, optimization, architecture
    subcategory VARCHAR(100),
    domain VARCHAR(100), -- frontend, backend, database, devops, design, testing
    technology VARCHAR(100), -- react, nodejs, postgresql, docker, etc
    
    -- Conteúdo
    title VARCHAR(255) NOT NULL,
    problem_description TEXT,
    context_description TEXT,
    solution_description TEXT NOT NULL,
    code_examples JSONB DEFAULT '[]'::jsonb,
    references JSONB DEFAULT '[]'::jsonb,
    
    -- Metadados de qualidade
    confidence_score DECIMAL(3,2) DEFAULT 0.50, -- 0.00 a 1.00
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 1.0000,
    last_used TIMESTAMP WITH TIME ZONE,
    
    -- Tags e busca
    tags JSONB DEFAULT '[]'::jsonb,
    keywords JSONB DEFAULT '[]'::jsonb,
    search_vector tsvector,
    
    -- Relacionamentos
    related_knowledge JSONB DEFAULT '[]'::jsonb,
    superseded_by UUID REFERENCES torre_knowledge(id),
    
    -- Validação e evolução
    validated_count INTEGER DEFAULT 0,
    invalidated_count INTEGER DEFAULT 0,
    needs_update BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- AGENTES E PERFORMANCE
-- ================================

CREATE TABLE torre_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES torre_suprema_context(id) ON DELETE CASCADE,
    
    -- Identificação
    agent_name VARCHAR(100) NOT NULL,
    agent_type VARCHAR(100) NOT NULL, -- backend, frontend, database, devops, design, qa, pm
    version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Capacidades
    skills JSONB DEFAULT '[]'::jsonb,
    mcp_tools JSONB DEFAULT '[]'::jsonb,
    frameworks JSONB DEFAULT '[]'::jsonb,
    languages JSONB DEFAULT '[]'::jsonb,
    
    -- Estado atual
    status VARCHAR(50) DEFAULT 'idle', -- idle, busy, error, maintenance
    current_task_id UUID REFERENCES torre_tasks(id),
    workload_level VARCHAR(20) DEFAULT 'normal', -- low, normal, high, overloaded
    
    -- Performance histórica
    tasks_completed INTEGER DEFAULT 0,
    tasks_failed INTEGER DEFAULT 0,
    average_completion_time INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 1.0000,
    user_satisfaction DECIMAL(3,2) DEFAULT 5.00,
    
    -- Especialização e aprendizado
    specialization_areas JSONB DEFAULT '[]'::jsonb,
    learning_preferences JSONB DEFAULT '[]'::jsonb,
    improvement_areas JSONB DEFAULT '[]'::jsonb,
    
    -- Configurações
    max_concurrent_tasks INTEGER DEFAULT 1,
    preferred_working_hours JSONB DEFAULT '{}'::jsonb,
    notification_preferences JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- MCP INTEGRATIONS E FERRAMENTAS
-- ================================

CREATE TABLE torre_mcp_servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES torre_suprema_context(id) ON DELETE CASCADE,
    
    -- Servidor MCP
    name VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL, -- github, slack, notion, figma, postgres, docker, etc
    version VARCHAR(20),
    url VARCHAR(500),
    
    -- Configuração
    connection_config JSONB NOT NULL,
    authentication_config JSONB DEFAULT '{}'::jsonb,
    rate_limits JSONB DEFAULT '{}'::jsonb,
    
    -- Estado
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, error, maintenance
    last_health_check TIMESTAMP WITH TIME ZONE,
    health_status VARCHAR(20) DEFAULT 'healthy', -- healthy, warning, unhealthy
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    
    -- Usage statistics
    operations_total INTEGER DEFAULT 0,
    operations_successful INTEGER DEFAULT 0,
    operations_failed INTEGER DEFAULT 0,
    average_response_time INTEGER DEFAULT 0,
    
    -- Capabilities
    available_operations JSONB DEFAULT '[]'::jsonb,
    supported_formats JSONB DEFAULT '[]'::jsonb,
    limitations JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- ANALYTICS E INSIGHTS
-- ================================

CREATE TABLE torre_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES torre_suprema_context(id) ON DELETE CASCADE,
    
    -- Tipo de métrica
    metric_type VARCHAR(100) NOT NULL, -- performance, productivity, quality, user_satisfaction
    metric_name VARCHAR(100) NOT NULL,
    metric_category VARCHAR(100), -- agent, project, task, system, user
    
    -- Valores
    numeric_value DECIMAL(15,4),
    text_value TEXT,
    json_value JSONB,
    boolean_value BOOLEAN,
    
    -- Contexto
    entity_id UUID, -- ID da entidade relacionada (projeto, task, agente)
    entity_type VARCHAR(50), -- project, task, agent, user, system
    aggregation_period VARCHAR(20), -- real_time, hourly, daily, weekly, monthly
    
    -- Metadados
    tags JSONB DEFAULT '[]'::jsonb,
    dimensions JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamp
    measurement_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- CONFIGURAÇÕES E PREFERÊNCIAS
-- ================================

CREATE TABLE torre_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES torre_suprema_context(id) ON DELETE CASCADE,
    
    -- Configuração
    config_category VARCHAR(100) NOT NULL, -- system, user, project, agent, mcp
    config_name VARCHAR(100) NOT NULL,
    config_value JSONB NOT NULL,
    
    -- Metadados
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false,
    requires_restart BOOLEAN DEFAULT false,
    
    -- Validação
    validation_rules JSONB DEFAULT '{}'::jsonb,
    last_validated TIMESTAMP WITH TIME ZONE,
    is_valid BOOLEAN DEFAULT true,
    
    -- Auditoria
    created_by VARCHAR(100) DEFAULT 'torre_suprema',
    updated_by VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- ÍNDICES PARA PERFORMANCE EXTREMA
-- ================================

-- Context queries
CREATE INDEX idx_context_session ON torre_suprema_context(session_id);
CREATE INDEX idx_context_user ON torre_suprema_context(user_id);
CREATE INDEX idx_context_project ON torre_suprema_context(current_project);
CREATE INDEX idx_context_status ON torre_suprema_context(current_status);
CREATE INDEX idx_context_last_interaction ON torre_suprema_context(last_interaction DESC);

-- Conversation search
CREATE INDEX idx_messages_context ON conversation_messages(context_id);
CREATE INDEX idx_messages_sequence ON conversation_messages(context_id, message_sequence);
CREATE INDEX idx_messages_type ON conversation_messages(message_type);
CREATE INDEX idx_messages_timestamp ON conversation_messages(timestamp DESC);
CREATE INDEX idx_messages_intent ON conversation_messages(intent_detected);

-- Project management
CREATE INDEX idx_projects_context ON torre_projects(context_id);
CREATE INDEX idx_projects_status ON torre_projects(status);
CREATE INDEX idx_projects_type ON torre_projects(project_type);
CREATE INDEX idx_projects_priority ON torre_projects(priority);
CREATE INDEX idx_projects_completion ON torre_projects(completion_percentage DESC);

-- Task tracking
CREATE INDEX idx_tasks_context ON torre_tasks(context_id);
CREATE INDEX idx_tasks_project ON torre_tasks(project_id);
CREATE INDEX idx_tasks_parent ON torre_tasks(parent_task_id);
CREATE INDEX idx_tasks_status ON torre_tasks(status);
CREATE INDEX idx_tasks_type ON torre_tasks(task_type);
CREATE INDEX idx_tasks_agent ON torre_tasks(assigned_agent);
CREATE INDEX idx_tasks_priority ON torre_tasks(priority);

-- Knowledge base search
CREATE INDEX idx_knowledge_context ON torre_knowledge(context_id);
CREATE INDEX idx_knowledge_category ON torre_knowledge(category, subcategory);
CREATE INDEX idx_knowledge_technology ON torre_knowledge(technology);
CREATE INDEX idx_knowledge_confidence ON torre_knowledge(confidence_score DESC);
CREATE INDEX idx_knowledge_usage ON torre_knowledge(usage_count DESC);
CREATE INDEX idx_knowledge_tags ON torre_knowledge USING GIN (tags);
CREATE INDEX idx_knowledge_search ON torre_knowledge USING GIN (search_vector);

-- Agent performance
CREATE INDEX idx_agents_context ON torre_agents(context_id);
CREATE INDEX idx_agents_type ON torre_agents(agent_type);
CREATE INDEX idx_agents_status ON torre_agents(status);
CREATE INDEX idx_agents_performance ON torre_agents(success_rate DESC, average_completion_time ASC);

-- MCP monitoring
CREATE INDEX idx_mcp_context ON torre_mcp_servers(context_id);
CREATE INDEX idx_mcp_type ON torre_mcp_servers(type);
CREATE INDEX idx_mcp_status ON torre_mcp_servers(status);
CREATE INDEX idx_mcp_health ON torre_mcp_servers(health_status);

-- Analytics
CREATE INDEX idx_analytics_context ON torre_analytics(context_id);
CREATE INDEX idx_analytics_metric ON torre_analytics(metric_type, metric_name);
CREATE INDEX idx_analytics_entity ON torre_analytics(entity_type, entity_id);
CREATE INDEX idx_analytics_time ON torre_analytics(measurement_time DESC);

-- Configurations
CREATE INDEX idx_config_context ON torre_configurations(context_id);
CREATE INDEX idx_config_category ON torre_configurations(config_category, config_name);

-- ================================
-- TRIGGERS PARA INTELIGÊNCIA
-- ================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_torre_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF TG_TABLE_NAME = 'torre_suprema_context' THEN
        NEW.last_interaction = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_context_timestamp BEFORE UPDATE ON torre_suprema_context FOR EACH ROW EXECUTE FUNCTION update_torre_timestamp();
CREATE TRIGGER update_projects_timestamp BEFORE UPDATE ON torre_projects FOR EACH ROW EXECUTE FUNCTION update_torre_timestamp();
CREATE TRIGGER update_tasks_timestamp BEFORE UPDATE ON torre_tasks FOR EACH ROW EXECUTE FUNCTION update_torre_timestamp();
CREATE TRIGGER update_knowledge_timestamp BEFORE UPDATE ON torre_knowledge FOR EACH ROW EXECUTE FUNCTION update_torre_timestamp();
CREATE TRIGGER update_agents_timestamp BEFORE UPDATE ON torre_agents FOR EACH ROW EXECUTE FUNCTION update_torre_timestamp();
CREATE TRIGGER update_mcp_timestamp BEFORE UPDATE ON torre_mcp_servers FOR EACH ROW EXECUTE FUNCTION update_torre_timestamp();
CREATE TRIGGER update_config_timestamp BEFORE UPDATE ON torre_configurations FOR EACH ROW EXECUTE FUNCTION update_torre_timestamp();

-- Auto-update search vectors for knowledge
CREATE OR REPLACE FUNCTION update_knowledge_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('portuguese', 
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.problem_description, '') || ' ' ||
        COALESCE(NEW.solution_description, '') || ' ' ||
        COALESCE(array_to_string(ARRAY(SELECT jsonb_array_elements_text(NEW.tags)), ' '), '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_knowledge_search BEFORE INSERT OR UPDATE ON torre_knowledge FOR EACH ROW EXECUTE FUNCTION update_knowledge_search_vector();

-- ================================
-- VIEWS PARA INSIGHTS RÁPIDOS
-- ================================

-- Visão geral do contexto atual
CREATE VIEW torre_current_status AS
SELECT 
    c.id,
    c.session_id,
    c.current_status,
    c.current_project,
    c.current_task,
    c.current_phase,
    c.tasks_completed,
    c.success_rate,
    c.user_satisfaction_score,
    p.name as project_name,
    p.completion_percentage as project_completion,
    COUNT(t.id) as active_tasks,
    c.last_interaction
FROM torre_suprema_context c
LEFT JOIN torre_projects p ON c.current_project = p.id::text
LEFT JOIN torre_tasks t ON p.id = t.project_id AND t.status IN ('pending', 'in_progress')
GROUP BY c.id, p.name, p.completion_percentage;

-- Performance dos agentes
CREATE VIEW torre_agent_performance AS
SELECT 
    a.agent_name,
    a.agent_type,
    a.status,
    a.tasks_completed,
    a.tasks_failed,
    CASE 
        WHEN (a.tasks_completed + a.tasks_failed) > 0 
        THEN a.tasks_completed::decimal / (a.tasks_completed + a.tasks_failed) 
        ELSE 1.0 
    END as success_rate_calculated,
    a.average_completion_time,
    a.user_satisfaction,
    a.last_activity
FROM torre_agents a;

-- Top conhecimentos mais úteis
CREATE VIEW torre_top_knowledge AS
SELECT 
    k.title,
    k.category,
    k.technology,
    k.confidence_score,
    k.usage_count,
    k.success_rate,
    k.tags,
    k.last_used
FROM torre_knowledge k
WHERE k.usage_count > 0
ORDER BY (k.confidence_score * k.usage_count * k.success_rate) DESC
LIMIT 50;

-- Status dos projetos ativos
CREATE VIEW torre_active_projects AS
SELECT 
    p.name,
    p.project_type,
    p.status,
    p.priority,
    p.completion_percentage,
    p.tasks_total,
    p.tasks_completed,
    COUNT(t.id) as active_tasks,
    p.deadline,
    EXTRACT(EPOCH FROM (p.deadline - NOW())) / 3600 as hours_to_deadline
FROM torre_projects p
LEFT JOIN torre_tasks t ON p.id = t.project_id AND t.status IN ('pending', 'in_progress')
WHERE p.status IN ('planning', 'active')
GROUP BY p.id
ORDER BY p.priority DESC, p.deadline ASC;

-- ================================
-- DADOS INICIAIS DA TORRE SUPREMA
-- ================================

-- Contexto inicial da Torre Suprema
INSERT INTO torre_suprema_context (
    session_id, 
    user_id,
    current_status,
    current_project,
    current_task,
    current_phase,
    communication_style,
    tech_stack_preferences,
    user_preferences
) VALUES (
    'torre-suprema-session-' || extract(epoch from now()),
    'developer-master',
    'active',
    'mcp-supreme-agency',
    'Criando banco de dados de contexto permanente',
    'development',
    'enthusiastic',
    '["typescript", "nodejs", "react", "postgresql", "docker", "kubernetes", "mcp"]'::jsonb,
    '{"language": "portuguese", "enthusiasm_level": "maximum", "detail_level": "comprehensive"}'::jsonb
);

-- Configurações iniciais
INSERT INTO torre_configurations (context_id, config_category, config_name, config_value, description) VALUES
((SELECT id FROM torre_suprema_context LIMIT 1), 'system', 'memory_retention_days', '365', 'Dias para manter dados na memória'),
((SELECT id FROM torre_suprema_context LIMIT 1), 'system', 'max_concurrent_tasks', '10', 'Máximo de tarefas simultâneas'),
((SELECT id FROM torre_suprema_context LIMIT 1), 'system', 'auto_learning_enabled', 'true', 'Aprendizado automático ativado'),
((SELECT id FROM torre_suprema_context LIMIT 1), 'user', 'preferred_language', '"portuguese"'::jsonb, 'Idioma preferido do usuário'),
((SELECT id FROM torre_suprema_context LIMIT 1), 'user', 'enthusiasm_level', '"maximum"'::jsonb, 'Nível de entusiasmo da Torre');

-- Conhecimento inicial
INSERT INTO torre_knowledge (
    context_id,
    category,
    domain,
    technology,
    title,
    problem_description,
    solution_description,
    tags,
    confidence_score
) VALUES 
(
    (SELECT id FROM torre_suprema_context LIMIT 1),
    'best_practice',
    'database',
    'postgresql',
    'Context Database Design',
    'Como manter contexto permanente de uma IA assistente',
    'Criar database completo com todas as tabelas de contexto, histórico, conhecimento e analytics',
    '["database", "context", "ai", "memory", "postgresql"]'::jsonb,
    0.95
);

COMMENT ON DATABASE current_database() IS 'Torre Suprema Context Database - Inteligência Permanente que Nunca Esquece! 🧠🚀';

-- ================================
-- FUNÇÕES UTILITÁRIAS
-- ================================

-- Função para buscar contexto completo
CREATE OR REPLACE FUNCTION get_torre_context(p_session_id VARCHAR DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    context_data JSON;
BEGIN
    SELECT json_build_object(
        'context', c.*,
        'current_project', p.*,
        'recent_messages', (
            SELECT json_agg(m.* ORDER BY m.timestamp DESC)
            FROM conversation_messages m 
            WHERE m.context_id = c.id 
            LIMIT 10
        ),
        'active_tasks', (
            SELECT json_agg(t.*)
            FROM torre_tasks t 
            WHERE t.context_id = c.id 
            AND t.status IN ('pending', 'in_progress')
        ),
        'top_knowledge', (
            SELECT json_agg(k.*)
            FROM torre_knowledge k 
            WHERE k.context_id = c.id 
            ORDER BY k.confidence_score DESC, k.usage_count DESC
            LIMIT 5
        ),
        'agents_status', (
            SELECT json_agg(a.*)
            FROM torre_agents a 
            WHERE a.context_id = c.id
        )
    ) INTO context_data
    FROM torre_suprema_context c
    LEFT JOIN torre_projects p ON c.current_project = p.id::text
    WHERE c.session_id = COALESCE(p_session_id, c.session_id)
    ORDER BY c.last_interaction DESC
    LIMIT 1;
    
    RETURN context_data;
END;
$$ LANGUAGE plpgsql;

-- Função para salvar aprendizado
CREATE OR REPLACE FUNCTION save_torre_learning(
    p_context_id UUID,
    p_category VARCHAR,
    p_domain VARCHAR,
    p_technology VARCHAR,
    p_title VARCHAR,
    p_problem TEXT,
    p_solution TEXT,
    p_tags JSONB,
    p_confidence DECIMAL DEFAULT 0.8
)
RETURNS UUID AS $$
DECLARE
    learning_id UUID;
BEGIN
    INSERT INTO torre_knowledge (
        context_id, category, domain, technology, title, 
        problem_description, solution_description, tags, confidence_score
    ) VALUES (
        p_context_id, p_category, p_domain, p_technology, p_title,
        p_problem, p_solution, p_tags, p_confidence
    ) RETURNING id INTO learning_id;
    
    RETURN learning_id;
END;
$$ LANGUAGE plpgsql;