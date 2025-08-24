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
export declare class ContextApiService {
    private contextManager;
    private memorySystem;
    private readonly logger;
    constructor(contextManager: TorreContextManager, memorySystem: MemorySystem);
    getCurrentContext(): Promise<any>;
    saveConversation(data: ConversationRequest): Promise<any>;
    saveLearning(data: LearningRequest): Promise<any>;
    updateContext(data: ContextUpdateRequest): Promise<any>;
    recordAgentPerformance(data: AgentPerformanceRequest): Promise<any>;
    searchKnowledge(query: string, category?: string, technology?: string): Promise<any>;
    getRecentConversations(limit?: number): Promise<any>;
    exportContext(): Promise<any>;
    getFullDashboard(): Promise<any>;
}
export declare class ContextController {
    private contextService;
    private readonly logger;
    constructor(contextService: ContextApiService);
    getCurrentContext(): Promise<any>;
    getDashboard(): Promise<any>;
    getRecentConversations(limit?: string): Promise<any>;
    searchKnowledge(query: string, category?: string, technology?: string): Promise<any>;
    saveConversation(data: ConversationRequest): Promise<any>;
    saveLearning(data: LearningRequest): Promise<any>;
    recordAgentPerformance(data: AgentPerformanceRequest): Promise<any>;
    updateContext(data: ContextUpdateRequest): Promise<any>;
    exportContext(): Promise<any>;
    healthCheck(): Promise<{
        success: boolean;
        data: {
            service: string;
            status: string;
            timestamp: Date;
            version: string;
        };
    }>;
}
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class ContextWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private contextManager;
    private memorySystem;
    server: Server;
    private readonly logger;
    private connectedClients;
    constructor(contextManager: TorreContextManager, memorySystem: MemorySystem);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    private broadcast;
    sendContextUpdate(data: any): void;
    sendSystemAlert(alert: any): void;
}
import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class ContextTrackingMiddleware implements NestMiddleware {
    private contextService;
    private readonly logger;
    constructor(contextService: ContextApiService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
    private detectIntentFromPath;
}
export {};
