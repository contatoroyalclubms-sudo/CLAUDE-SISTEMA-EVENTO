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
export declare class TorreContextManager extends EventEmitter {
    private readonly logger;
    private pool;
    private currentContext;
    private sessionId;
    private contextId;
    constructor();
    private initializeDatabase;
    private loadOrCreateContext;
    saveConversation(conversation: Partial<ConversationMessage>): Promise<string>;
    saveLearning(learning: TorreLearning): Promise<string>;
    updateCurrentTask(task: string, phase?: string): Promise<void>;
    updateCurrentProject(projectId: string, projectName: string): Promise<void>;
    searchKnowledge(query: string, category?: string, technology?: string): Promise<any[]>;
    getRecentConversations(limit?: number): Promise<any[]>;
    getActiveProjects(): Promise<any[]>;
    getAgentsStatus(): Promise<any[]>;
    recordAgentPerformance(agentName: string, taskCompleted: boolean, executionTime: number, userRating?: number): Promise<void>;
    updateUserSatisfaction(rating: number, feedback?: string): Promise<void>;
    exportContext(): Promise<any>;
    getContextStats(): Promise<any>;
    private updateLastInteraction;
    private mapDatabaseRowToContext;
    private detectAgentType;
    cleanup(): Promise<void>;
    get currentContextData(): TorreContext | null;
    get currentSessionId(): string;
    get currentContextId(): string;
    debugContext(): Promise<void>;
}
export {};
