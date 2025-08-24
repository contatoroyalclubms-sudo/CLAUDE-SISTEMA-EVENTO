"use strict";
/**
 * 🏰 TORRE SUPREMA - ORCHESTRADOR SIMPLIFICADO
 * Sistema de coordenação de agentes sem dependências externas
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.torreSuprema = exports.TorreSupremaOrchestrator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class TorreSupremaOrchestrator {
    constructor() {
        this.agents = new Map();
        this.tasks = new Map();
        this.contextFile = path.join(__dirname, '../../torre-suprema-memory.json');
        this.initializeAgents();
        this.loadContext();
        console.log('🏰 Torre Suprema Orchestrator Ativo!');
    }
    initializeAgents() {
        const agents = [
            {
                id: 'architect-master-001',
                name: 'Arquiteto Master',
                type: 'architecture',
                skills: ['clean-architecture', 'microservices', 'system-design', 'patterns'],
                status: 'idle',
                performance: { tasksCompleted: 0, averageTime: 0, successRate: 1.0 }
            },
            {
                id: 'ultra-backend-001',
                name: 'Ultra Backend Performance',
                type: 'backend-performance',
                skills: ['performance', 'scalability', 'databases', 'caching', 'optimization'],
                status: 'idle',
                performance: { tasksCompleted: 0, averageTime: 0, successRate: 1.0 }
            },
            {
                id: 'general-purpose-001',
                name: 'General Purpose Agent',
                type: 'general',
                skills: ['research', 'analysis', 'problem-solving', 'multi-task'],
                status: 'idle',
                performance: { tasksCompleted: 0, averageTime: 0, successRate: 1.0 }
            }
        ];
        agents.forEach(agent => this.agents.set(agent.id, agent));
        console.log(`✅ ${agents.length} agentes especializados iniciados!`);
    }
    async submitTask(task) {
        const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newTask = {
            ...task,
            id: taskId,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.tasks.set(taskId, newTask);
        console.log(`📋 Nova tarefa: ${taskId} (${task.type})`);
        await this.assignTask(taskId);
        return taskId;
    }
    async assignTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task)
            return;
        // Encontrar agente disponível do tipo correto
        const availableAgents = Array.from(this.agents.values())
            .filter(agent => agent.status === 'idle' && agent.type === task.type)
            .sort((a, b) => b.performance.successRate - a.performance.successRate);
        if (availableAgents.length === 0) {
            // Se não há agente específico, usar general-purpose
            const generalAgent = Array.from(this.agents.values())
                .find(agent => agent.status === 'idle' && agent.type === 'general');
            if (generalAgent) {
                availableAgents.push(generalAgent);
            }
        }
        if (availableAgents.length === 0) {
            console.warn(`⚠️ Nenhum agente disponível para tarefa ${taskId}`);
            return;
        }
        const selectedAgent = availableAgents[0];
        task.assignedAgent = selectedAgent.id;
        task.status = 'in_progress';
        task.updatedAt = new Date();
        selectedAgent.status = 'busy';
        selectedAgent.currentTask = taskId;
        console.log(`🎯 Tarefa ${taskId} atribuída ao agente ${selectedAgent.name}`);
        // Retornar informação sobre qual agente especializado usar
        return this.prepareAgentExecution(task, selectedAgent);
    }
    async prepareAgentExecution(task, agent) {
        const startTime = Date.now();
        try {
            // Preparar instruções para o agente especializado
            const agentInstructions = this.generateAgentInstructions(task, agent);
            // Simular execução (na prática seria um chamada para o agente MCP)
            console.log(`⚡ Executando com ${agent.name}:`);
            console.log(`📝 Instruções: ${agentInstructions}`);
            // Salvar resultado mock por enquanto
            const executionTime = Date.now() - startTime;
            await this.completeTask(task.id, agent.id, executionTime, true, {
                agentUsed: agent.name,
                instructions: agentInstructions,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error(`❌ Erro na tarefa ${task.id}:`, error);
            await this.completeTask(task.id, agent.id, Date.now() - startTime, false);
        }
    }
    generateAgentInstructions(task, agent) {
        const instructions = {
            'architecture': `Use o agent 'architect-master' para: ${task.description}. Foque em padrões arquiteturais, design patterns e estrutura do sistema.`,
            'backend-performance': `Use o agent 'ultra-backend-performance-specialist' para: ${task.description}. Otimize performance, escalabilidade e consultas de banco.`,
            'general': `Use o agent 'general-purpose' para: ${task.description}. Faça pesquisa completa e análise detalhada.`
        };
        return instructions[agent.type] || `Execute: ${task.description}`;
    }
    async completeTask(taskId, agentId, executionTime, success, result) {
        const task = this.tasks.get(taskId);
        const agent = this.agents.get(agentId);
        if (!task || !agent)
            return;
        task.status = success ? 'completed' : 'failed';
        task.updatedAt = new Date();
        task.result = result;
        agent.status = 'idle';
        agent.currentTask = undefined;
        agent.performance.tasksCompleted++;
        agent.performance.averageTime =
            (agent.performance.averageTime + executionTime) / agent.performance.tasksCompleted;
        agent.performance.successRate = success ?
            (agent.performance.successRate * agent.performance.tasksCompleted + 1) / (agent.performance.tasksCompleted + 1) :
            (agent.performance.successRate * agent.performance.tasksCompleted) / (agent.performance.tasksCompleted + 1);
        console.log(`✅ Tarefa ${taskId} ${success ? 'concluída' : 'falhou'} por ${agent.name}`);
        await this.saveContext();
    }
    loadContext() {
        try {
            if (fs.existsSync(this.contextFile)) {
                const data = fs.readFileSync(this.contextFile, 'utf8');
                const context = JSON.parse(data);
                if (context.tasks) {
                    context.tasks.forEach((task) => {
                        this.tasks.set(task.id, {
                            ...task,
                            createdAt: new Date(task.createdAt),
                            updatedAt: new Date(task.updatedAt)
                        });
                    });
                }
                if (context.agents) {
                    context.agents.forEach((agent) => {
                        if (this.agents.has(agent.id)) {
                            this.agents.set(agent.id, { ...this.agents.get(agent.id), performance: agent.performance });
                        }
                    });
                }
                console.log('🧠 Contexto carregado da memória!');
            }
        }
        catch (error) {
            console.log('ℹ️ Iniciando com contexto limpo');
        }
    }
    async saveContext() {
        try {
            const context = {
                timestamp: new Date().toISOString(),
                tasks: Array.from(this.tasks.values()),
                agents: Array.from(this.agents.values()),
                stats: this.getStats()
            };
            fs.writeFileSync(this.contextFile, JSON.stringify(context, null, 2));
            console.log('💾 Contexto salvo!');
        }
        catch (error) {
            console.error('❌ Erro ao salvar contexto:', error);
        }
    }
    getStats() {
        const totalTasks = this.tasks.size;
        const completedTasks = Array.from(this.tasks.values()).filter(t => t.status === 'completed').length;
        const successRate = totalTasks > 0 ? completedTasks / totalTasks : 1;
        return {
            totalTasks,
            completedTasks,
            successRate,
            activeAgents: Array.from(this.agents.values()).filter(a => a.status !== 'offline').length,
            timestamp: new Date().toISOString()
        };
    }
    getAgents() {
        return Array.from(this.agents.values());
    }
    getTasks() {
        return Array.from(this.tasks.values());
    }
    getTaskById(taskId) {
        return this.tasks.get(taskId);
    }
    getAgentById(agentId) {
        return this.agents.get(agentId);
    }
}
exports.TorreSupremaOrchestrator = TorreSupremaOrchestrator;
// Singleton instance
exports.torreSuprema = new TorreSupremaOrchestrator();
