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
var MemorySystem_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemorySystem = void 0;
const common_1 = require("@nestjs/common");
const events_1 = require("events");
let MemorySystem = MemorySystem_1 = class MemorySystem extends events_1.EventEmitter {
    constructor() {
        super();
        this.logger = new common_1.Logger(MemorySystem_1.name);
        this.memoryStore = new Map();
        this.knowledgeGraph = new Map();
        this.logger.log('🧠 Torre Suprema Memory System Activated!');
        this.initializeMemory();
    }
    initializeMemory() {
        this.projectMemory = {
            id: `project-${Date.now()}`,
            projectName: 'MCP Supreme Agency',
            description: 'A Agência de Agentes MCP Mais Épica do Mundo',
            techStack: ['typescript', 'nestjs', 'react', 'postgresql', 'redis', 'kafka', 'docker', 'kubernetes'],
            architecture: {
                pattern: 'microservices_event_driven',
                style: 'distributed_ai_orchestration',
                principles: ['scalability', 'resilience', 'intelligence', 'automation']
            },
            tasks: [],
            agents: [],
            configurations: [],
            conversations: [],
            learnings: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.initializeKnowledgeBase();
    }
    initializeKnowledgeBase() {
        const initialKnowledge = [
            {
                id: 'kb-001',
                category: 'best_practice',
                title: 'MCP Integration Pattern',
                description: 'Como integrar múltiplos servidores MCP de forma eficiente',
                context: 'Orquestração de agentes com ferramentas MCP',
                solution: 'Usar connection pooling + circuit breakers + retry logic',
                tags: ['mcp', 'integration', 'resilience'],
                confidence: 0.9,
                timesUsed: 0,
                lastUsed: new Date()
            },
            {
                id: 'kb-002',
                category: 'pattern',
                title: 'Agent Task Assignment Algorithm',
                description: 'Algoritmo otimizado para atribuir tarefas aos melhores agentes',
                context: 'Sistema de orquestração inteligente',
                solution: 'Score = (skillMatch * 0.4) + (performance * 0.3) + (availability * 0.3)',
                tags: ['algorithm', 'optimization', 'agents'],
                confidence: 0.95,
                timesUsed: 0,
                lastUsed: new Date()
            },
            {
                id: 'kb-003',
                category: 'solution',
                title: 'Real-time Dashboard Updates',
                description: 'Como manter dashboard sincronizado em tempo real',
                context: 'Monitoramento de agentes e tarefas',
                solution: 'WebSockets + Event Sourcing + CQRS pattern',
                tags: ['realtime', 'dashboard', 'websockets'],
                confidence: 0.85,
                timesUsed: 0,
                lastUsed: new Date()
            }
        ];
        initialKnowledge.forEach(knowledge => {
            this.projectMemory.learnings.push(knowledge);
            this.addToKnowledgeGraph(knowledge);
        });
    }
    async rememberTask(task) {
        const taskId = `task-memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const taskMemory = {
            ...task,
            id: taskId,
            lessons: []
        };
        this.projectMemory.tasks.push(taskMemory);
        this.updateMemory();
        this.logger.log(`💾 Task remembered: ${taskId}`);
        return taskId;
    }
    async rememberConversation(conversation) {
        const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const conversationMemory = {
            ...conversation,
            id: conversationId
        };
        this.projectMemory.conversations.push(conversationMemory);
        this.updateMemory();
        this.logger.log(`🗣️ Conversation remembered: ${conversationId}`);
        return conversationId;
    }
    async learnFromExperience(learning) {
        const learningId = `learn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const learningMemory = {
            ...learning,
            id: learningId,
            timesUsed: 0,
            lastUsed: new Date()
        };
        this.projectMemory.learnings.push(learningMemory);
        this.addToKnowledgeGraph(learningMemory);
        this.updateMemory();
        this.logger.log(`🎓 New learning acquired: ${learning.title}`);
        return learningId;
    }
    async rememberConfiguration(config) {
        const configId = `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const configMemory = {
            ...config,
            id: configId,
            lastUsed: new Date()
        };
        this.projectMemory.configurations.push(configMemory);
        this.updateMemory();
        this.logger.log(`⚙️ Configuration remembered: ${config.name}`);
        return configId;
    }
    async searchKnowledge(query, category) {
        const searchTerms = query.toLowerCase().split(' ');
        return this.projectMemory.learnings
            .filter(learning => {
            if (category && learning.category !== category)
                return false;
            const searchableText = [
                learning.title,
                learning.description,
                learning.context,
                learning.solution,
                ...learning.tags
            ].join(' ').toLowerCase();
            return searchTerms.some(term => searchableText.includes(term));
        })
            .sort((a, b) => b.confidence - a.confidence);
    }
    async getRelevantExperiences(context) {
        const contextTerms = context.toLowerCase().split(' ');
        const relevantLearnings = [];
        this.projectMemory.learnings.forEach(learning => {
            let relevance = 0;
            const learningText = [learning.title, learning.description, learning.context].join(' ').toLowerCase();
            contextTerms.forEach(term => {
                if (learningText.includes(term)) {
                    relevance += learning.confidence * learning.timesUsed * 0.1;
                }
            });
            if (relevance > 0) {
                relevantLearnings.push({ learning, relevance });
            }
        });
        return relevantLearnings
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 5)
            .map(item => item.learning);
    }
    async updateAgentPerformance(agentId, performance) {
        let agentMemory = this.projectMemory.agents.find(a => a.id === agentId);
        if (!agentMemory) {
            agentMemory = {
                id: agentId,
                name: `Agent ${agentId}`,
                type: 'unknown',
                skills: [],
                performance: {
                    tasksCompleted: 0,
                    successRate: 1.0,
                    averageTime: 0,
                    bestPractices: [],
                    commonIssues: []
                },
                preferences: {
                    workingStyle: 'adaptive',
                    preferredTools: [],
                    optimizations: []
                }
            };
            this.projectMemory.agents.push(agentMemory);
        }
        Object.assign(agentMemory.performance, performance);
        this.updateMemory();
    }
    addToKnowledgeGraph(learning) {
        learning.tags.forEach(tag => {
            if (!this.knowledgeGraph.has(tag)) {
                this.knowledgeGraph.set(tag, new Set());
            }
            this.knowledgeGraph.get(tag).add(learning.id);
        });
    }
    updateMemory() {
        this.projectMemory.updatedAt = new Date();
        this.emit('memoryUpdated', this.projectMemory);
    }
    getFullMemory() {
        return { ...this.projectMemory };
    }
    getMemoryStats() {
        return {
            totalTasks: this.projectMemory.tasks.length,
            totalConversations: this.projectMemory.conversations.length,
            totalLearnings: this.projectMemory.learnings.length,
            totalConfigurations: this.projectMemory.configurations.length,
            totalAgents: this.projectMemory.agents.length,
            knowledgeGraphSize: this.knowledgeGraph.size,
            memoryAge: Date.now() - this.projectMemory.createdAt.getTime()
        };
    }
    async exportMemory() {
        const memoryExport = {
            ...this.projectMemory,
            exportDate: new Date(),
            version: '1.0.0'
        };
        return JSON.stringify(memoryExport, null, 2);
    }
    async importMemory(memoryData) {
        try {
            const imported = JSON.parse(memoryData);
            this.projectMemory = { ...imported };
            this.rebuildKnowledgeGraph();
            this.logger.log('📥 Memory successfully imported!');
        }
        catch (error) {
            this.logger.error('❌ Failed to import memory:', error);
            throw error;
        }
    }
    rebuildKnowledgeGraph() {
        this.knowledgeGraph.clear();
        this.projectMemory.learnings.forEach(learning => {
            this.addToKnowledgeGraph(learning);
        });
    }
};
exports.MemorySystem = MemorySystem;
exports.MemorySystem = MemorySystem = MemorySystem_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MemorySystem);
