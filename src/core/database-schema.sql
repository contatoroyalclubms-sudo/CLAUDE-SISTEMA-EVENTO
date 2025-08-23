-- 🧠 Torre Suprema Memory Database Schema
-- Nunca mais esqueceremos de NADA!

-- Configurações de banco
SET timezone = 'UTC';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================
-- PROJETO E CONFIGURAÇÕES GERAIS
-- ================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tech_stack JSONB,
    architecture JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- mcp_server, database, deployment, security, monitoring
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, deprecated
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- AGENTES E PERFORMANCE
-- ================================

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- development, design, testing, deployment, analysis
    skills JSONB, -- array de skills
    mcp_tools JSONB, -- array de ferramentas MCP
    status VARCHAR(50) DEFAULT 'idle', -- idle, busy, offline
    current_task_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE agent_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    tasks_completed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 1.0000,
    average_time BIGINT DEFAULT 0, -- em millisegundos
    best_practices JSONB, -- array de melhores práticas
    common_issues JSONB, -- array de problemas comuns
    preferences JSONB, -- working_style, preferred_tools, optimizations
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- TAREFAS E WORKFLOWS
-- ================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- development, design, testing, deployment, analysis
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    description TEXT,
    payload JSONB,
    required_mcp_tools JSONB, -- array de ferramentas necessárias
    assigned_agent_id UUID REFERENCES agents(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, failed
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    execution_time BIGINT, -- em millisegundos
    result JSONB,
    lessons JSONB, -- array de lições aprendidas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(100), -- full_stack_development, design_to_code, etc
    steps JSONB NOT NULL, -- array de passos do workflow
    orchestration_pattern VARCHAR(100), -- sequential, parallel, conditional, feedback_loop
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- CONVERSAS E CONTEXTO
-- ================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    context JSONB,
    actions_taken JSONB, -- array de ações executadas
    outcomes JSONB, -- array de resultados
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- CONHECIMENTO E APRENDIZADO
-- ================================

CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- best_practice, solution, pattern, bug_fix, optimization
    title VARCHAR(255) NOT NULL,
    description TEXT,
    context TEXT,
    solution TEXT NOT NULL,
    tags JSONB, -- array de tags
    confidence DECIMAL(3,2) DEFAULT 0.50, -- 0.00 a 1.00
    times_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- MCP INTEGRAÇÕES E LOGS
-- ================================

CREATE TABLE mcp_servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- github, slack, notion, figma, etc
    connection_config JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, error
    health_check_url VARCHAR(500),
    last_health_check TIMESTAMP WITH TIME ZONE,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE mcp_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mcp_server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id),
    operation_type VARCHAR(100) NOT NULL,
    operation_data JSONB,
    result JSONB,
    execution_time BIGINT, -- em millisegundos
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- MÉTRICAS E MONITORAMENTO
-- ================================

CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL, -- cpu, memory, response_time, throughput
    metric_name VARCHAR(255) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50), -- ms, mb, percent, count
    tags JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- info, warning, error, critical
    component VARCHAR(100), -- orchestrator, agent, mcp_server
    message TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- ÍNDICES PARA PERFORMANCE
-- ================================

-- Índices para busca rápida
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_agent ON tasks(assigned_agent_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_type ON agents(type);
CREATE INDEX idx_agents_project ON agents(project_id);

CREATE INDEX idx_conversations_project ON conversations(project_id);
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp DESC);

CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX idx_knowledge_base_tags ON knowledge_base USING GIN (tags);
CREATE INDEX idx_knowledge_base_confidence ON knowledge_base(confidence DESC);
CREATE INDEX idx_knowledge_base_times_used ON knowledge_base(times_used DESC);

CREATE INDEX idx_mcp_servers_status ON mcp_servers(status);
CREATE INDEX idx_mcp_operations_server ON mcp_operations(mcp_server_id);
CREATE INDEX idx_mcp_operations_task ON mcp_operations(task_id);
CREATE INDEX idx_mcp_operations_timestamp ON mcp_operations(timestamp DESC);

CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);

CREATE INDEX idx_system_events_type ON system_events(event_type);
CREATE INDEX idx_system_events_timestamp ON system_events(timestamp DESC);

-- ================================
-- TRIGGERS PARA UPDATED_AT
-- ================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mcp_servers_updated_at BEFORE UPDATE ON mcp_servers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_performance_updated_at BEFORE UPDATE ON agent_performance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- VIEWS PARA CONSULTAS COMUNS
-- ================================

-- Visão geral de performance dos agentes
CREATE VIEW agent_performance_summary AS
SELECT 
    a.id,
    a.name,
    a.type,
    a.status,
    ap.tasks_completed,
    ap.success_rate,
    ap.average_time,
    (SELECT COUNT(*) FROM tasks WHERE assigned_agent_id = a.id AND status = 'in_progress') as current_tasks
FROM agents a
LEFT JOIN agent_performance ap ON a.id = ap.agent_id;

-- Estatísticas de tarefas por tipo
CREATE VIEW task_statistics AS
SELECT 
    type,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_tasks,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
    AVG(execution_time) as avg_execution_time
FROM tasks 
GROUP BY type;

-- Top conhecimentos mais utilizados
CREATE VIEW top_knowledge AS
SELECT 
    title,
    category,
    confidence,
    times_used,
    tags
FROM knowledge_base 
WHERE times_used > 0
ORDER BY times_used DESC, confidence DESC
LIMIT 20;

-- Status dos servidores MCP
CREATE VIEW mcp_server_health AS
SELECT 
    name,
    type,
    status,
    error_count,
    last_health_check,
    CASE 
        WHEN last_health_check > NOW() - INTERVAL '5 minutes' THEN 'healthy'
        WHEN last_health_check > NOW() - INTERVAL '30 minutes' THEN 'warning'
        ELSE 'unhealthy'
    END as health_status
FROM mcp_servers;

-- ================================
-- DADOS INICIAIS
-- ================================

-- Projeto inicial
INSERT INTO projects (id, name, description, tech_stack, architecture, status) VALUES (
    uuid_generate_v4(),
    'MCP Supreme Agency',
    'A Agência de Agentes MCP Mais Épica do Mundo',
    '["typescript", "nestjs", "react", "postgresql", "redis", "kafka", "docker", "kubernetes"]'::jsonb,
    '{"pattern": "microservices_event_driven", "style": "distributed_ai_orchestration", "principles": ["scalability", "resilience", "intelligence", "automation"]}'::jsonb,
    'active'
);

-- Conhecimentos iniciais
INSERT INTO knowledge_base (project_id, category, title, description, context, solution, tags, confidence) VALUES 
(
    (SELECT id FROM projects WHERE name = 'MCP Supreme Agency'),
    'best_practice',
    'MCP Integration Pattern',
    'Como integrar múltiplos servidores MCP de forma eficiente',
    'Orquestração de agentes com ferramentas MCP',
    'Usar connection pooling + circuit breakers + retry logic',
    '["mcp", "integration", "resilience"]'::jsonb,
    0.90
),
(
    (SELECT id FROM projects WHERE name = 'MCP Supreme Agency'),
    'pattern',
    'Agent Task Assignment Algorithm', 
    'Algoritmo otimizado para atribuir tarefas aos melhores agentes',
    'Sistema de orquestração inteligente',
    'Score = (skillMatch * 0.4) + (performance * 0.3) + (availability * 0.3)',
    '["algorithm", "optimization", "agents"]'::jsonb,
    0.95
);

-- Configurações MCP iniciais
INSERT INTO mcp_servers (project_id, name, type, connection_config, status) VALUES 
(
    (SELECT id FROM projects WHERE name = 'MCP Supreme Agency'),
    'GitHub MCP',
    'github',
    '{"url": "github.com", "auth_required": true, "tools": ["repositories", "issues", "pull_requests"]}'::jsonb,
    'active'
),
(
    (SELECT id FROM projects WHERE name = 'MCP Supreme Agency'),
    'Slack MCP',
    'slack',
    '{"workspace": "torre-suprema", "channels": ["general", "dev", "alerts"], "bot_enabled": true}'::jsonb,
    'active'
);

COMMENT ON DATABASE current_database() IS 'Torre Suprema Memory System - Nunca esqueceremos de NADA! 🧠🚀';