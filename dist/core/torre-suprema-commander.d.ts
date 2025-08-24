import { EventEmitter } from 'events';
import { OrchestratorEngine } from './orchestrator';
export interface TorreSupremaCommand {
    id: string;
    type: 'project_creation' | 'full_stack_dev' | 'deployment' | 'analysis' | 'emergency';
    objective: string;
    requirements: string[];
    priority: 'low' | 'medium' | 'high' | 'critical' | 'suprema';
    estimatedComplexity: number;
    requiredAgents: string[];
    mcpIntegrations: string[];
    deliverables: string[];
    createdAt: Date;
    status: 'planning' | 'executing' | 'monitoring' | 'completed' | 'blocked';
}
export interface AgentCoordination {
    agentId: string;
    role: 'leader' | 'collaborator' | 'reviewer' | 'support';
    tasks: string[];
    dependencies: string[];
    communicationChannel: string;
}
export declare class TorreSupremaCommander extends EventEmitter {
    private readonly logger;
    private orchestrator;
    private activeCommands;
    private agentCoordinations;
    private globalStrategy;
    constructor(orchestrator: OrchestratorEngine);
    private initializeSupremeProtocols;
    executeSupremeCommand(commandInput: Omit<TorreSupremaCommand, 'id' | 'createdAt' | 'status'>): Promise<string>;
    private strategicPlanning;
    private analyzeAndBreakdownTasks;
    private createTask;
    private optimizeAgentAllocation;
    private coordinateAgents;
    private executeWithSupremacy;
    private monitorCommandProgress;
    private completeSupremeCommand;
    private handleCommandEmergency;
    private initiateEmergencyRecovery;
    private generateSupremeReport;
    private onTaskCompleted;
    private onTaskFailed;
    private onAgentStatusChange;
    getActiveCommands(): TorreSupremaCommand[];
    getCommandStatus(commandId: string): TorreSupremaCommand | undefined;
    getAgentCoordinations(commandId: string): AgentCoordination[] | undefined;
    emergencyShutdown(): Promise<void>;
}
