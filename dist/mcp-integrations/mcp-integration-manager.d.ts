import { EventEmitter } from 'events';
export interface MCPServerConfig {
    id: string;
    name: string;
    command: string;
    args?: string[];
    env?: Record<string, string>;
    capabilities: MCPCapability[];
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    lastConnection: Date;
    errorCount: number;
    maxRetries: number;
}
export interface MCPCapability {
    type: 'resources' | 'tools' | 'prompts' | 'logging';
    name: string;
    description: string;
    parameters?: any;
    required?: boolean;
}
export interface MCPOperation {
    id: string;
    serverId: string;
    type: 'resource' | 'tool' | 'prompt';
    operation: string;
    parameters: any;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    result?: any;
    error?: string;
    startTime: Date;
    endTime?: Date;
    executionTime?: number;
}
export interface MCPServerStats {
    serverId: string;
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageResponseTime: number;
    uptime: number;
    lastHealthCheck: Date;
}
export declare class MCPIntegrationManager extends EventEmitter {
    private readonly logger;
    private servers;
    private clients;
    private operations;
    private stats;
    private healthCheckInterval;
    constructor();
    private initializeMCPServers;
    private startHealthMonitoring;
    connectAllServers(): Promise<void>;
    connectToServer(serverId: string): Promise<boolean>;
    private setupClientEventHandlers;
    private handleClientError;
    private handleClientDisconnection;
    executeOperation(serverId: string, type: 'resource' | 'tool' | 'prompt', operation: string, parameters?: any): Promise<any>;
    private executeResourceOperation;
    private executeToolOperation;
    private executePromptOperation;
    private updateServerStats;
    private performHealthChecks;
    createGitHubIssue(title: string, body: string, repository: string): Promise<any>;
    sendSlackMessage(channel: string, message: string): Promise<any>;
    createNotionPage(database: string, properties: any): Promise<any>;
    deployToVercel(projectPath: string): Promise<any>;
    queryDatabase(query: string): Promise<any>;
    runDockerContainer(image: string, options?: any): Promise<any>;
    manageDNS(zone: string, record: any): Promise<any>;
    getFigmaFile(fileKey: string): Promise<any>;
    executeBatchOperations(operations: Array<{
        serverId: string;
        type: 'resource' | 'tool' | 'prompt';
        operation: string;
        parameters: any;
    }>): Promise<any[]>;
    coordinatedDeployment(projectData: any): Promise<any>;
    getServerStatus(serverId: string): MCPServerConfig | undefined;
    getAllServers(): MCPServerConfig[];
    getConnectedServers(): MCPServerConfig[];
    getServerStats(serverId: string): MCPServerStats | undefined;
    getAllStats(): MCPServerStats[];
    getOperation(operationId: string): MCPOperation | undefined;
    getRecentOperations(limit?: number): MCPOperation[];
    disconnectServer(serverId: string): Promise<void>;
    disconnectAllServers(): Promise<void>;
    generateIntegrationReport(): Promise<any>;
}
