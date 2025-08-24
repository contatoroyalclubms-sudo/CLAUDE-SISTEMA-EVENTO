/**
 * 🏰 TORRE SUPREMA - ORCHESTRADOR SIMPLIFICADO
 * Sistema de coordenação de agentes sem dependências externas
 */
export interface AgentTask {
    id: string;
    type: 'architecture' | 'backend-performance' | 'general' | 'frontend' | 'design';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    payload: any;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    assignedAgent?: string;
    createdAt: Date;
    updatedAt: Date;
    result?: any;
}
export interface TorreAgent {
    id: string;
    name: string;
    type: string;
    skills: string[];
    status: 'idle' | 'busy' | 'offline';
    currentTask?: string;
    performance: {
        tasksCompleted: number;
        averageTime: number;
        successRate: number;
    };
}
export declare class TorreSupremaOrchestrator {
    private agents;
    private tasks;
    private contextFile;
    constructor();
    private initializeAgents;
    submitTask(task: Omit<AgentTask, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string>;
    private assignTask;
    private prepareAgentExecution;
    private generateAgentInstructions;
    private completeTask;
    private loadContext;
    private saveContext;
    getStats(): {
        totalTasks: number;
        completedTasks: number;
        successRate: number;
        activeAgents: number;
        timestamp: string;
    };
    getAgents(): TorreAgent[];
    getTasks(): AgentTask[];
    getTaskById(taskId: string): AgentTask | undefined;
    getAgentById(agentId: string): TorreAgent | undefined;
}
export declare const torreSuprema: TorreSupremaOrchestrator;
