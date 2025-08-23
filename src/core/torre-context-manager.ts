import { Injectable, Logger } from '@nestjs/common';
import { Pool, Client } from 'pg';
import { EventEmitter } from 'events';

interface TorreContext {
  id: string;
  sessionId: string;
  userId: string;
  currentStatus: string;
  currentProject: string;
  currentTask: string;
  currentPhase: string;
  conversationHistory: any[];
  userIntent: string;
  userPreferences: any;
  activeProjects: any[];
  completedProjects: any[];
  learnedPatterns: any[];
  solvedProblems: any[];
  bestPractices: any[];
  tasksCompleted: number;
  successRate: number;
  userSatisfactionScore: number;
  lastInteraction: Date;
}

interface ConversationMessage {
  userMessage: string;
  torreResponse: string;
  messageType: string;
  intentDetected: string;
  sentiment: string;
  actionsTaken: any[];
  toolsUsed: any[];
  outcome: string;
  executionTime: number;
  lessonsLearned: any[];
}

interface TorreLearning {
  category: string;
  domain: string;
  technology: string;
  title: string;
  problemDescription: string;
  solutionDescription: string;
  tags: string[];
  confidenceScore: number;
  codeExamples?: any[];
}

@Injectable()
export class TorreContextManager extends EventEmitter {
  private readonly logger = new Logger(TorreContextManager.name);
  private pool: Pool;
  private currentContext: TorreContext | null = null;
  private sessionId: string;
  private contextId: string;

  constructor() {
    super();
    this.sessionId = `torre-suprema-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.initializeDatabase();
    this.logger.log('🧠 Torre Suprema Context Manager ATIVADO!');
  }

  private async initializeDatabase() {
    try {
      this.pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'torre_suprema_memory',
        user: process.env.DB_USER || 'torre_admin',
        password: process.env.DB_PASSWORD || 'suprema_power_2024',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Testar conexão
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.logger.log('✅ Conexão com banco de contexto estabelecida!');
      await this.loadOrCreateContext();
    } catch (error) {
      this.logger.error('❌ Erro ao conectar com banco de contexto:', error);
      throw error;
    }
  }

  private async loadOrCreateContext() {
    try {
      // Tentar carregar contexto existente ou criar novo
      let result = await this.pool.query(`
        SELECT * FROM get_torre_context($1)
      `, [this.sessionId]);

      if (result.rows.length === 0 || !result.rows[0].get_torre_context) {
        // Criar novo contexto
        const contextResult = await this.pool.query(`
          INSERT INTO torre_suprema_context (
            session_id, 
            user_id, 
            current_status, 
            current_task,
            current_phase,
            communication_style,
            tech_stack_preferences,
            user_preferences
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
          RETURNING *
        `, [
          this.sessionId,
          'developer-master',
          'active',
          'Inicializando Torre Suprema Context Manager',
          'initialization',
          'enthusiastic',
          JSON.stringify(['typescript', 'nodejs', 'react', 'postgresql', 'mcp']),
          JSON.stringify({ 
            language: 'portuguese', 
            enthusiasm_level: 'maximum',
            detail_level: 'comprehensive',
            never_forget: true
          })
        ]);

        this.contextId = contextResult.rows[0].id;
        this.currentContext = this.mapDatabaseRowToContext(contextResult.rows[0]);
        
        this.logger.log(`🆕 Novo contexto criado: ${this.contextId}`);
      } else {
        // Carregar contexto existente
        const contextData = result.rows[0].get_torre_context;
        this.currentContext = contextData.context;
        this.contextId = this.currentContext.id;
        
        this.logger.log(`📖 Contexto carregado: ${this.contextId}`);
        this.logger.log(`📊 Tarefas completadas: ${this.currentContext.tasksCompleted}`);
        this.logger.log(`⭐ Taxa de sucesso: ${this.currentContext.successRate}`);
      }

      // Atualizar última interação
      await this.updateLastInteraction();

    } catch (error) {
      this.logger.error('❌ Erro ao carregar/criar contexto:', error);
      throw error;
    }
  }

  async saveConversation(conversation: Partial<ConversationMessage>): Promise<string> {
    try {
      const result = await this.pool.query(`
        INSERT INTO conversation_messages (
          context_id,
          message_sequence,
          user_message,
          torre_response,
          message_type,
          intent_detected,
          sentiment,
          actions_taken,
          tools_used,
          outcome,
          execution_time,
          lessons_learned
        ) VALUES ($1, 
          (SELECT COALESCE(MAX(message_sequence), 0) + 1 FROM conversation_messages WHERE context_id = $1),
          $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING id
      `, [
        this.contextId,
        conversation.userMessage || '',
        conversation.torreResponse || '',
        conversation.messageType || 'general',
        conversation.intentDetected || 'unknown',
        conversation.sentiment || 'neutral',
        JSON.stringify(conversation.actionsTaken || []),
        JSON.stringify(conversation.toolsUsed || []),
        conversation.outcome || 'success',
        conversation.executionTime || 0,
        JSON.stringify(conversation.lessonsLearned || [])
      ]);

      await this.updateLastInteraction();
      this.emit('conversationSaved', { id: result.rows[0].id, conversation });

      return result.rows[0].id;
    } catch (error) {
      this.logger.error('❌ Erro ao salvar conversa:', error);
      throw error;
    }
  }

  async saveLearning(learning: TorreLearning): Promise<string> {
    try {
      const result = await this.pool.query(`
        SELECT save_torre_learning($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        this.contextId,
        learning.category,
        learning.domain,
        learning.technology,
        learning.title,
        learning.problemDescription,
        learning.solutionDescription,
        JSON.stringify(learning.tags),
        learning.confidenceScore
      ]);

      this.logger.log(`🎓 Novo aprendizado salvo: ${learning.title}`);
      this.emit('learningAdded', { id: result.rows[0].save_torre_learning, learning });

      return result.rows[0].save_torre_learning;
    } catch (error) {
      this.logger.error('❌ Erro ao salvar aprendizado:', error);
      throw error;
    }
  }

  async updateCurrentTask(task: string, phase?: string): Promise<void> {
    try {
      await this.pool.query(`
        UPDATE torre_suprema_context 
        SET current_task = $1, 
            current_phase = $2,
            tasks_completed = tasks_completed + CASE WHEN $3 THEN 1 ELSE 0 END
        WHERE id = $4
      `, [task, phase || this.currentContext?.currentPhase, phase === 'completed', this.contextId]);

      if (this.currentContext) {
        this.currentContext.currentTask = task;
        if (phase) this.currentContext.currentPhase = phase;
        if (phase === 'completed') this.currentContext.tasksCompleted++;
      }

      this.logger.log(`📝 Tarefa atualizada: ${task}`);
      this.emit('taskUpdated', { task, phase });
    } catch (error) {
      this.logger.error('❌ Erro ao atualizar tarefa:', error);
      throw error;
    }
  }

  async updateCurrentProject(projectId: string, projectName: string): Promise<void> {
    try {
      await this.pool.query(`
        UPDATE torre_suprema_context 
        SET current_project = $1
        WHERE id = $2
      `, [projectId, this.contextId]);

      if (this.currentContext) {
        this.currentContext.currentProject = projectId;
      }

      this.logger.log(`📂 Projeto atualizado: ${projectName}`);
      this.emit('projectUpdated', { projectId, projectName });
    } catch (error) {
      this.logger.error('❌ Erro ao atualizar projeto:', error);
      throw error;
    }
  }

  async searchKnowledge(query: string, category?: string, technology?: string): Promise<any[]> {
    try {
      const result = await this.pool.query(`
        SELECT k.*, 
               ts_rank(k.search_vector, plainto_tsquery('portuguese', $1)) as rank
        FROM torre_knowledge k
        WHERE k.context_id = $2
          AND ($3 IS NULL OR k.category = $3)
          AND ($4 IS NULL OR k.technology = $4)
          AND (
            k.search_vector @@ plainto_tsquery('portuguese', $1)
            OR k.tags @> $5
          )
        ORDER BY rank DESC, k.confidence_score DESC, k.usage_count DESC
        LIMIT 20
      `, [
        query,
        this.contextId,
        category,
        technology,
        JSON.stringify([query.toLowerCase()])
      ]);

      return result.rows;
    } catch (error) {
      this.logger.error('❌ Erro ao buscar conhecimento:', error);
      return [];
    }
  }

  async getRecentConversations(limit: number = 10): Promise<any[]> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM conversation_messages 
        WHERE context_id = $1 
        ORDER BY timestamp DESC 
        LIMIT $2
      `, [this.contextId, limit]);

      return result.rows;
    } catch (error) {
      this.logger.error('❌ Erro ao buscar conversas recentes:', error);
      return [];
    }
  }

  async getActiveProjects(): Promise<any[]> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM torre_active_projects 
        WHERE EXISTS (
          SELECT 1 FROM torre_projects tp 
          WHERE tp.name = torre_active_projects.name 
          AND tp.context_id = $1
        )
        ORDER BY priority DESC, deadline ASC
      `, [this.contextId]);

      return result.rows;
    } catch (error) {
      this.logger.error('❌ Erro ao buscar projetos ativos:', error);
      return [];
    }
  }

  async getAgentsStatus(): Promise<any[]> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM torre_agent_performance 
        WHERE EXISTS (
          SELECT 1 FROM torre_agents ta 
          WHERE ta.agent_name = torre_agent_performance.agent_name 
          AND ta.context_id = $1
        )
        ORDER BY success_rate_calculated DESC
      `, [this.contextId]);

      return result.rows;
    } catch (error) {
      this.logger.error('❌ Erro ao buscar status dos agentes:', error);
      return [];
    }
  }

  async recordAgentPerformance(
    agentName: string,
    taskCompleted: boolean,
    executionTime: number,
    userRating?: number
  ): Promise<void> {
    try {
      await this.pool.query(`
        INSERT INTO torre_agents (
          context_id, agent_name, agent_type, tasks_completed, tasks_failed, 
          average_completion_time, user_satisfaction
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (context_id, agent_name) 
        DO UPDATE SET
          tasks_completed = torre_agents.tasks_completed + $4,
          tasks_failed = torre_agents.tasks_failed + $5,
          average_completion_time = (torre_agents.average_completion_time + $6) / 2,
          user_satisfaction = COALESCE($7, torre_agents.user_satisfaction),
          last_activity = NOW()
      `, [
        this.contextId,
        agentName,
        this.detectAgentType(agentName),
        taskCompleted ? 1 : 0,
        taskCompleted ? 0 : 1,
        executionTime,
        userRating || 5.0
      ]);

      this.emit('agentPerformanceRecorded', { 
        agentName, 
        taskCompleted, 
        executionTime, 
        userRating 
      });
    } catch (error) {
      this.logger.error('❌ Erro ao registrar performance do agente:', error);
    }
  }

  async updateUserSatisfaction(rating: number, feedback?: string): Promise<void> {
    try {
      await this.pool.query(`
        UPDATE torre_suprema_context 
        SET user_satisfaction_score = (user_satisfaction_score + $1) / 2
        WHERE id = $2
      `, [rating, this.contextId]);

      if (feedback) {
        await this.pool.query(`
          UPDATE conversation_messages 
          SET user_feedback = $1, user_rating = $2
          WHERE context_id = $3 
          ORDER BY timestamp DESC 
          LIMIT 1
        `, [feedback, rating, this.contextId]);
      }

      this.logger.log(`⭐ Satisfação do usuário atualizada: ${rating}/5`);
    } catch (error) {
      this.logger.error('❌ Erro ao atualizar satisfação:', error);
    }
  }

  async exportContext(): Promise<any> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM get_torre_context($1)
      `, [this.sessionId]);

      return {
        exportDate: new Date(),
        contextData: result.rows[0]?.get_torre_context || {},
        sessionId: this.sessionId,
        contextId: this.contextId
      };
    } catch (error) {
      this.logger.error('❌ Erro ao exportar contexto:', error);
      throw error;
    }
  }

  async getContextStats(): Promise<any> {
    try {
      const result = await this.pool.query(`
        SELECT 
          c.tasks_completed,
          c.success_rate,
          c.user_satisfaction_score,
          COUNT(DISTINCT cm.id) as total_conversations,
          COUNT(DISTINCT tp.id) as total_projects,
          COUNT(DISTINCT tk.id) as total_knowledge,
          COUNT(DISTINCT ta.id) as total_agents,
          (c.last_interaction - c.created_at) as total_session_time
        FROM torre_suprema_context c
        LEFT JOIN conversation_messages cm ON c.id = cm.context_id
        LEFT JOIN torre_projects tp ON c.id = tp.context_id
        LEFT JOIN torre_knowledge tk ON c.id = tk.context_id
        LEFT JOIN torre_agents ta ON c.id = ta.context_id
        WHERE c.id = $1
        GROUP BY c.id
      `, [this.contextId]);

      return result.rows[0] || {};
    } catch (error) {
      this.logger.error('❌ Erro ao buscar estatísticas:', error);
      return {};
    }
  }

  private async updateLastInteraction(): Promise<void> {
    try {
      await this.pool.query(`
        UPDATE torre_suprema_context 
        SET last_interaction = NOW() 
        WHERE id = $1
      `, [this.contextId]);
    } catch (error) {
      this.logger.error('❌ Erro ao atualizar última interação:', error);
    }
  }

  private mapDatabaseRowToContext(row: any): TorreContext {
    return {
      id: row.id,
      sessionId: row.session_id,
      userId: row.user_id,
      currentStatus: row.current_status,
      currentProject: row.current_project,
      currentTask: row.current_task,
      currentPhase: row.current_phase,
      conversationHistory: row.conversation_history || [],
      userIntent: row.user_intent,
      userPreferences: row.user_preferences || {},
      activeProjects: row.active_projects || [],
      completedProjects: row.completed_projects || [],
      learnedPatterns: row.learned_patterns || [],
      solvedProblems: row.solved_problems || [],
      bestPractices: row.best_practices || [],
      tasksCompleted: row.tasks_completed || 0,
      successRate: parseFloat(row.success_rate) || 1.0,
      userSatisfactionScore: parseFloat(row.user_satisfaction_score) || 5.0,
      lastInteraction: row.last_interaction
    };
  }

  private detectAgentType(agentName: string): string {
    const name = agentName.toLowerCase();
    if (name.includes('backend')) return 'backend';
    if (name.includes('frontend')) return 'frontend';
    if (name.includes('database')) return 'database';
    if (name.includes('devops')) return 'devops';
    if (name.includes('design')) return 'design';
    if (name.includes('qa') || name.includes('test')) return 'qa';
    if (name.includes('project') || name.includes('manager')) return 'project_manager';
    return 'general';
  }

  // Método para o ciclo de vida da aplicação
  async cleanup(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.log('🔄 Context Manager cleanup completado');
    } catch (error) {
      this.logger.error('❌ Erro no cleanup:', error);
    }
  }

  // Getters para acesso ao contexto atual
  get currentContextData(): TorreContext | null {
    return this.currentContext;
  }

  get currentSessionId(): string {
    return this.sessionId;
  }

  get currentContextId(): string {
    return this.contextId;
  }

  // Método para debug e desenvolvimento
  async debugContext(): Promise<void> {
    const stats = await this.getContextStats();
    const recentConversations = await this.getRecentConversations(5);
    const topKnowledge = await this.searchKnowledge('', undefined, undefined);

    this.logger.log('🐛 DEBUG - Contexto Atual:');
    this.logger.log(`Session ID: ${this.sessionId}`);
    this.logger.log(`Context ID: ${this.contextId}`);
    this.logger.log(`Tarefas: ${stats.tasks_completed}`);
    this.logger.log(`Conversas: ${stats.total_conversations}`);
    this.logger.log(`Projetos: ${stats.total_projects}`);
    this.logger.log(`Conhecimentos: ${stats.total_knowledge}`);
    this.logger.log(`Agentes: ${stats.total_agents}`);
    this.logger.log(`Satisfação: ${stats.user_satisfaction_score}/5`);
  }
}