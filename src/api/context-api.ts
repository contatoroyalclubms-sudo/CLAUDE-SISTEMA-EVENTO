import { Controller, Get, Post, Put, Body, Param, Query, Injectable, Logger } from '@nestjs/common';
import { TorreContextManager } from '../core/torre-context-manager';
import { MemorySystem } from '../core/memory-system';

interface ContextUpdateRequest {
  task?: string;
  phase?: string;
  project?: {
    id: string;
    name: string;
  };
  userSatisfaction?: {
    rating: number;
    feedback?: string;
  };
}

interface ConversationRequest {
  userMessage: string;
  torreResponse: string;
  messageType?: string;
  intentDetected?: string;
  sentiment?: string;
  actionsTaken?: any[];
  toolsUsed?: any[];
  outcome?: string;
  executionTime?: number;
  lessonsLearned?: any[];
}

interface LearningRequest {
  category: string;
  domain: string;
  technology: string;
  title: string;
  problemDescription: string;
  solutionDescription: string;
  tags: string[];
  confidenceScore?: number;
  codeExamples?: any[];
}

interface AgentPerformanceRequest {
  agentName: string;
  taskCompleted: boolean;
  executionTime: number;
  userRating?: number;
}

@Injectable()
export class ContextApiService {
  private readonly logger = new Logger(ContextApiService.name);

  constructor(
    private contextManager: TorreContextManager,
    private memorySystem: MemorySystem
  ) {}

  async getCurrentContext(): Promise<any> {
    try {
      const context = this.contextManager.currentContextData;
      const stats = await this.contextManager.getContextStats();
      const activeProjects = await this.contextManager.getActiveProjects();
      const agentsStatus = await this.contextManager.getAgentsStatus();
      
      return {
        success: true,
        data: {
          context,
          stats,
          activeProjects,
          agentsStatus,
          sessionId: this.contextManager.currentSessionId,
          contextId: this.contextManager.currentContextId
        }
      };
    } catch (error) {
      this.logger.error('❌ Erro ao buscar contexto atual:', error);
      return { success: false, error: error.message };
    }
  }

  async saveConversation(data: ConversationRequest): Promise<any> {
    try {
      const conversationId = await this.contextManager.saveConversation(data);
      
      // Também salvar no memory system
      await this.memorySystem.rememberConversation({
        userMessage: data.userMessage,
        aiResponse: data.torreResponse,
        timestamp: new Date(),
        context: { messageType: data.messageType, intent: data.intentDetected },
        actionsTaken: data.actionsTaken || [],
        outcomes: [data.outcome || 'success']
      });

      this.logger.log(`💬 Conversa salva: ${conversationId}`);
      
      return {
        success: true,
        data: { conversationId }
      };
    } catch (error) {
      this.logger.error('❌ Erro ao salvar conversa:', error);
      return { success: false, error: error.message };
    }
  }

  async saveLearning(data: LearningRequest): Promise<any> {
    try {
      const learningId = await this.contextManager.saveLearning(data);
      
      // Também salvar no memory system
      await this.memorySystem.learnFromExperience({
        category: data.category as any,
        title: data.title,
        description: data.problemDescription,
        context: data.domain,
        solution: data.solutionDescription,
        tags: data.tags,
        confidence: data.confidenceScore || 0.8
      });

      this.logger.log(`🎓 Aprendizado salvo: ${learningId}`);
      
      return {
        success: true,
        data: { learningId }
      };
    } catch (error) {
      this.logger.error('❌ Erro ao salvar aprendizado:', error);
      return { success: false, error: error.message };
    }
  }

  async updateContext(data: ContextUpdateRequest): Promise<any> {
    try {
      const updates: string[] = [];

      if (data.task) {
        await this.contextManager.updateCurrentTask(data.task, data.phase);
        updates.push(`task: ${data.task}`);
      }

      if (data.project) {
        await this.contextManager.updateCurrentProject(data.project.id, data.project.name);
        updates.push(`project: ${data.project.name}`);
      }

      if (data.userSatisfaction) {
        await this.contextManager.updateUserSatisfaction(
          data.userSatisfaction.rating,
          data.userSatisfaction.feedback
        );
        updates.push(`satisfaction: ${data.userSatisfaction.rating}/5`);
      }

      this.logger.log(`🔄 Contexto atualizado: ${updates.join(', ')}`);
      
      return {
        success: true,
        data: { updatesApplied: updates }
      };
    } catch (error) {
      this.logger.error('❌ Erro ao atualizar contexto:', error);
      return { success: false, error: error.message };
    }
  }

  async recordAgentPerformance(data: AgentPerformanceRequest): Promise<any> {
    try {
      await this.contextManager.recordAgentPerformance(
        data.agentName,
        data.taskCompleted,
        data.executionTime,
        data.userRating
      );

      // Também atualizar no memory system
      await this.memorySystem.updateAgentPerformance(data.agentName, {
        tasksCompleted: data.taskCompleted ? 1 : 0,
        averageTime: data.executionTime
      });

      this.logger.log(`📊 Performance do agente registrada: ${data.agentName}`);
      
      return {
        success: true,
        data: { agentName: data.agentName, recorded: true }
      };
    } catch (error) {
      this.logger.error('❌ Erro ao registrar performance:', error);
      return { success: false, error: error.message };
    }
  }

  async searchKnowledge(query: string, category?: string, technology?: string): Promise<any> {
    try {
      // Buscar no context manager
      const contextResults = await this.contextManager.searchKnowledge(query, category, technology);
      
      // Buscar no memory system
      const memoryResults = await this.memorySystem.searchKnowledge(query, category as any);

      const combinedResults = {
        contextResults,
        memoryResults,
        totalFound: contextResults.length + memoryResults.length
      };

      this.logger.log(`🔍 Busca realizada: "${query}" - ${combinedResults.totalFound} resultados`);
      
      return {
        success: true,
        data: combinedResults
      };
    } catch (error) {
      this.logger.error('❌ Erro ao buscar conhecimento:', error);
      return { success: false, error: error.message };
    }
  }

  async getRecentConversations(limit: number = 10): Promise<any> {
    try {
      const conversations = await this.contextManager.getRecentConversations(limit);
      
      return {
        success: true,
        data: { conversations, count: conversations.length }
      };
    } catch (error) {
      this.logger.error('❌ Erro ao buscar conversas recentes:', error);
      return { success: false, error: error.message };
    }
  }

  async exportContext(): Promise<any> {
    try {
      const contextExport = await this.contextManager.exportContext();
      const memoryExport = await this.memorySystem.exportMemory();
      
      const fullExport = {
        exportDate: new Date(),
        context: contextExport,
        memory: JSON.parse(memoryExport),
        version: '1.0.0'
      };

      this.logger.log('📦 Contexto completo exportado');
      
      return {
        success: true,
        data: fullExport
      };
    } catch (error) {
      this.logger.error('❌ Erro ao exportar contexto:', error);
      return { success: false, error: error.message };
    }
  }

  async getFullDashboard(): Promise<any> {
    try {
      const context = await this.getCurrentContext();
      const recentConversations = await this.getRecentConversations(5);
      const memoryStats = this.memorySystem.getMemoryStats();

      return {
        success: true,
        data: {
          context: context.data,
          recentConversations: recentConversations.data,
          memoryStats,
          systemHealth: {
            contextManager: 'healthy',
            memorySystem: 'healthy',
            database: 'connected',
            lastUpdate: new Date()
          }
        }
      };
    } catch (error) {
      this.logger.error('❌ Erro ao buscar dashboard:', error);
      return { success: false, error: error.message };
    }
  }
}

@Controller('api/v1/context')
export class ContextController {
  private readonly logger = new Logger(ContextController.name);

  constructor(private contextService: ContextApiService) {}

  @Get('current')
  async getCurrentContext() {
    return await this.contextService.getCurrentContext();
  }

  @Get('dashboard')
  async getDashboard() {
    return await this.contextService.getFullDashboard();
  }

  @Get('conversations')
  async getRecentConversations(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return await this.contextService.getRecentConversations(limitNum);
  }

  @Get('knowledge/search')
  async searchKnowledge(
    @Query('q') query: string,
    @Query('category') category?: string,
    @Query('technology') technology?: string
  ) {
    return await this.contextService.searchKnowledge(query, category, technology);
  }

  @Post('conversation')
  async saveConversation(@Body() data: ConversationRequest) {
    return await this.contextService.saveConversation(data);
  }

  @Post('learning')
  async saveLearning(@Body() data: LearningRequest) {
    return await this.contextService.saveLearning(data);
  }

  @Post('agent/performance')
  async recordAgentPerformance(@Body() data: AgentPerformanceRequest) {
    return await this.contextService.recordAgentPerformance(data);
  }

  @Put('update')
  async updateContext(@Body() data: ContextUpdateRequest) {
    return await this.contextService.updateContext(data);
  }

  @Get('export')
  async exportContext() {
    return await this.contextService.exportContext();
  }

  @Get('health')
  async healthCheck() {
    return {
      success: true,
      data: {
        service: 'Torre Suprema Context API',
        status: 'healthy',
        timestamp: new Date(),
        version: '1.0.0'
      }
    };
  }
}

// ================================
// WEBSOCKET PARA UPDATES EM TEMPO REAL
// ================================

import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/context-updates'
})
@Injectable()
export class ContextWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ContextWebSocketGateway.name);
  private connectedClients: Set<Socket> = new Set();

  constructor(
    private contextManager: TorreContextManager,
    private memorySystem: MemorySystem
  ) {
    // Escutar eventos do context manager
    this.contextManager.on('conversationSaved', (data) => {
      this.broadcast('conversationSaved', data);
    });

    this.contextManager.on('learningAdded', (data) => {
      this.broadcast('learningAdded', data);
    });

    this.contextManager.on('taskUpdated', (data) => {
      this.broadcast('taskUpdated', data);
    });

    this.contextManager.on('projectUpdated', (data) => {
      this.broadcast('projectUpdated', data);
    });

    this.contextManager.on('agentPerformanceRecorded', (data) => {
      this.broadcast('agentPerformanceRecorded', data);
    });

    // Escutar eventos do memory system
    this.memorySystem.on('memoryUpdated', (data) => {
      this.broadcast('memoryUpdated', data);
    });
  }

  handleConnection(client: Socket) {
    this.connectedClients.add(client);
    this.logger.log(`🔌 Cliente conectado: ${client.id}`);
    
    // Enviar estado inicial
    client.emit('connected', {
      message: 'Conectado ao Torre Suprema Context Updates',
      sessionId: this.contextManager.currentSessionId,
      contextId: this.contextManager.currentContextId
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client);
    this.logger.log(`🔌 Cliente desconectado: ${client.id}`);
  }

  private broadcast(event: string, data: any) {
    this.server.emit(event, {
      timestamp: new Date(),
      event,
      data
    });
  }

  // Métodos para envio manual de updates
  sendContextUpdate(data: any) {
    this.broadcast('contextUpdate', data);
  }

  sendSystemAlert(alert: any) {
    this.broadcast('systemAlert', alert);
  }
}

// ================================
// MIDDLEWARE PARA AUTO-TRACKING
// ================================

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ContextTrackingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ContextTrackingMiddleware.name);

  constructor(
    private contextService: ContextApiService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    
    // Interceptar resposta para tracking automático
    const originalSend = res.send;
    res.send = function(data: any) {
      const executionTime = Date.now() - startTime;
      
      // Auto-track se for uma operação importante
      if (req.method === 'POST' && req.path.includes('/api/')) {
        setImmediate(async () => {
          try {
            await this.contextService.saveConversation({
              userMessage: `${req.method} ${req.path}`,
              torreResponse: 'API call processed',
              messageType: 'api_call',
              intentDetected: this.detectIntentFromPath(req.path),
              sentiment: 'neutral',
              actionsTaken: [`API: ${req.method} ${req.path}`],
              toolsUsed: ['API'],
              outcome: res.statusCode < 400 ? 'success' : 'error',
              executionTime
            });
          } catch (error) {
            this.logger.error('❌ Erro no auto-tracking:', error);
          }
        });
      }
      
      return originalSend.call(this, data);
    }.bind(this);

    next();
  }

  private detectIntentFromPath(path: string): string {
    if (path.includes('conversation')) return 'save_conversation';
    if (path.includes('learning')) return 'save_learning';
    if (path.includes('context')) return 'update_context';
    if (path.includes('agent')) return 'agent_operation';
    if (path.includes('knowledge')) return 'knowledge_search';
    return 'general_api_call';
  }
}