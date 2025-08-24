import { EventEmitter } from 'events';
export interface AgentTask {
    id: string;
    type: 'development' | 'design' | 'testing' | 'deployment' | 'analysis';
    priority: 'low' | 'medium' | 'high' | 'critical';
    payload: any;
    requiredMCPTools: string[];
    assignedAgent?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}
export interface Agent {
    id: string;
    name: string;
    type: string;
    skills: string[];
    mcpTools: string[];
    status: 'idle' | 'busy' | 'offline';
    currentTask?: string;
    performance: {
        tasksCompleted: number;
        averageTime: number;
        successRate: number;
    };
}
export declare class OrchestratorEngine extends EventEmitter {
    private readonly logger;
    private agents;
    private tasks;
    private mcpClients;
    constructor();
    private initializeAgents;
    submitTask(task: Omit<AgentTask, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string>;
    private assignTask;
    private executeTask;
    private executeMCPOperations;
    private simulateTaskExecution;
    private completeTask;
    getAgents(): Agent[];
    getTasks(): AgentTask[];
    getAgentStatus(agentId: string): Agent | undefined;
    getTaskStatus(taskId: string): AgentTask | undefined;
    initializeMCPConnections(mcpConfigs: any[]): Promise<void>;
}
