"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ContextApiService_1, ContextController_1, ContextWebSocketGateway_1, ContextTrackingMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextTrackingMiddleware = exports.ContextWebSocketGateway = exports.ContextController = exports.ContextApiService = void 0;
const common_1 = require("@nestjs/common");
const torre_context_manager_1 = require("../core/torre-context-manager");
const memory_system_1 = require("../core/memory-system");
let ContextApiService = ContextApiService_1 = class ContextApiService {
    constructor(contextManager, memorySystem) {
        this.contextManager = contextManager;
        this.memorySystem = memorySystem;
        this.logger = new common_1.Logger(ContextApiService_1.name);
    }
    async getCurrentContext() {
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
        }
        catch (error) {
            this.logger.error('❌ Erro ao buscar contexto atual:', error);
            return { success: false, error: error.message };
        }
    }
    async saveConversation(data) {
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
        }
        catch (error) {
            this.logger.error('❌ Erro ao salvar conversa:', error);
            return { success: false, error: error.message };
        }
    }
    async saveLearning(data) {
        try {
            const learningId = await this.contextManager.saveLearning(data);
            // Também salvar no memory system
            await this.memorySystem.learnFromExperience({
                category: data.category,
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
        }
        catch (error) {
            this.logger.error('❌ Erro ao salvar aprendizado:', error);
            return { success: false, error: error.message };
        }
    }
    async updateContext(data) {
        try {
            const updates = [];
            if (data.task) {
                await this.contextManager.updateCurrentTask(data.task, data.phase);
                updates.push(`task: ${data.task}`);
            }
            if (data.project) {
                await this.contextManager.updateCurrentProject(data.project.id, data.project.name);
                updates.push(`project: ${data.project.name}`);
            }
            if (data.userSatisfaction) {
                await this.contextManager.updateUserSatisfaction(data.userSatisfaction.rating, data.userSatisfaction.feedback);
                updates.push(`satisfaction: ${data.userSatisfaction.rating}/5`);
            }
            this.logger.log(`🔄 Contexto atualizado: ${updates.join(', ')}`);
            return {
                success: true,
                data: { updatesApplied: updates }
            };
        }
        catch (error) {
            this.logger.error('❌ Erro ao atualizar contexto:', error);
            return { success: false, error: error.message };
        }
    }
    async recordAgentPerformance(data) {
        try {
            await this.contextManager.recordAgentPerformance(data.agentName, data.taskCompleted, data.executionTime, data.userRating);
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
        }
        catch (error) {
            this.logger.error('❌ Erro ao registrar performance:', error);
            return { success: false, error: error.message };
        }
    }
    async searchKnowledge(query, category, technology) {
        try {
            // Buscar no context manager
            const contextResults = await this.contextManager.searchKnowledge(query, category, technology);
            // Buscar no memory system
            const memoryResults = await this.memorySystem.searchKnowledge(query, category);
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
        }
        catch (error) {
            this.logger.error('❌ Erro ao buscar conhecimento:', error);
            return { success: false, error: error.message };
        }
    }
    async getRecentConversations(limit = 10) {
        try {
            const conversations = await this.contextManager.getRecentConversations(limit);
            return {
                success: true,
                data: { conversations, count: conversations.length }
            };
        }
        catch (error) {
            this.logger.error('❌ Erro ao buscar conversas recentes:', error);
            return { success: false, error: error.message };
        }
    }
    async exportContext() {
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
        }
        catch (error) {
            this.logger.error('❌ Erro ao exportar contexto:', error);
            return { success: false, error: error.message };
        }
    }
    async getFullDashboard() {
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
        }
        catch (error) {
            this.logger.error('❌ Erro ao buscar dashboard:', error);
            return { success: false, error: error.message };
        }
    }
};
exports.ContextApiService = ContextApiService;
exports.ContextApiService = ContextApiService = ContextApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [torre_context_manager_1.TorreContextManager,
        memory_system_1.MemorySystem])
], ContextApiService);
let ContextController = ContextController_1 = class ContextController {
    constructor(contextService) {
        this.contextService = contextService;
        this.logger = new common_1.Logger(ContextController_1.name);
    }
    async getCurrentContext() {
        return await this.contextService.getCurrentContext();
    }
    async getDashboard() {
        return await this.contextService.getFullDashboard();
    }
    async getRecentConversations(limit) {
        const limitNum = limit ? parseInt(limit) : 10;
        return await this.contextService.getRecentConversations(limitNum);
    }
    async searchKnowledge(query, category, technology) {
        return await this.contextService.searchKnowledge(query, category, technology);
    }
    async saveConversation(data) {
        return await this.contextService.saveConversation(data);
    }
    async saveLearning(data) {
        return await this.contextService.saveLearning(data);
    }
    async recordAgentPerformance(data) {
        return await this.contextService.recordAgentPerformance(data);
    }
    async updateContext(data) {
        return await this.contextService.updateContext(data);
    }
    async exportContext() {
        return await this.contextService.exportContext();
    }
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
};
exports.ContextController = ContextController;
__decorate([
    (0, common_1.Get)('current'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContextController.prototype, "getCurrentContext", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContextController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContextController.prototype, "getRecentConversations", null);
__decorate([
    (0, common_1.Get)('knowledge/search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('technology')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ContextController.prototype, "searchKnowledge", null);
__decorate([
    (0, common_1.Post)('conversation'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContextController.prototype, "saveConversation", null);
__decorate([
    (0, common_1.Post)('learning'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContextController.prototype, "saveLearning", null);
__decorate([
    (0, common_1.Post)('agent/performance'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContextController.prototype, "recordAgentPerformance", null);
__decorate([
    (0, common_1.Put)('update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContextController.prototype, "updateContext", null);
__decorate([
    (0, common_1.Get)('export'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContextController.prototype, "exportContext", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContextController.prototype, "healthCheck", null);
exports.ContextController = ContextController = ContextController_1 = __decorate([
    (0, common_1.Controller)('api/v1/context'),
    __metadata("design:paramtypes", [ContextApiService])
], ContextController);
// ================================
// WEBSOCKET PARA UPDATES EM TEMPO REAL
// ================================
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let ContextWebSocketGateway = ContextWebSocketGateway_1 = class ContextWebSocketGateway {
    constructor(contextManager, memorySystem) {
        this.contextManager = contextManager;
        this.memorySystem = memorySystem;
        this.logger = new common_1.Logger(ContextWebSocketGateway_1.name);
        this.connectedClients = new Set();
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
    handleConnection(client) {
        this.connectedClients.add(client);
        this.logger.log(`🔌 Cliente conectado: ${client.id}`);
        // Enviar estado inicial
        client.emit('connected', {
            message: 'Conectado ao Torre Suprema Context Updates',
            sessionId: this.contextManager.currentSessionId,
            contextId: this.contextManager.currentContextId
        });
    }
    handleDisconnect(client) {
        this.connectedClients.delete(client);
        this.logger.log(`🔌 Cliente desconectado: ${client.id}`);
    }
    broadcast(event, data) {
        this.server.emit(event, {
            timestamp: new Date(),
            event,
            data
        });
    }
    // Métodos para envio manual de updates
    sendContextUpdate(data) {
        this.broadcast('contextUpdate', data);
    }
    sendSystemAlert(alert) {
        this.broadcast('systemAlert', alert);
    }
};
exports.ContextWebSocketGateway = ContextWebSocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ContextWebSocketGateway.prototype, "server", void 0);
exports.ContextWebSocketGateway = ContextWebSocketGateway = ContextWebSocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/context-updates'
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [torre_context_manager_1.TorreContextManager,
        memory_system_1.MemorySystem])
], ContextWebSocketGateway);
let ContextTrackingMiddleware = ContextTrackingMiddleware_1 = class ContextTrackingMiddleware {
    constructor(contextService) {
        this.contextService = contextService;
        this.logger = new common_1.Logger(ContextTrackingMiddleware_1.name);
    }
    async use(req, res, next) {
        const startTime = Date.now();
        // Interceptar resposta para tracking automático
        const originalSend = res.send;
        res.send = function (data) {
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
                    }
                    catch (error) {
                        this.logger.error('❌ Erro no auto-tracking:', error);
                    }
                });
            }
            return originalSend.call(this, data);
        }.bind(this);
        next();
    }
    detectIntentFromPath(path) {
        if (path.includes('conversation'))
            return 'save_conversation';
        if (path.includes('learning'))
            return 'save_learning';
        if (path.includes('context'))
            return 'update_context';
        if (path.includes('agent'))
            return 'agent_operation';
        if (path.includes('knowledge'))
            return 'knowledge_search';
        return 'general_api_call';
    }
};
exports.ContextTrackingMiddleware = ContextTrackingMiddleware;
exports.ContextTrackingMiddleware = ContextTrackingMiddleware = ContextTrackingMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ContextApiService])
], ContextTrackingMiddleware);
