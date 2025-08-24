import { EventEmitter } from 'events';
interface ProjectMemory {
    id: string;
    projectName: string;
    description: string;
    techStack: string[];
    architecture: any;
    tasks: TaskMemory[];
    agents: AgentMemory[];
    configurations: ConfigurationMemory[];
    conversations: ConversationMemory[];
    learnings: LearningMemory[];
    createdAt: Date;
    updatedAt: Date;
}
interface TaskMemory {
    id: string;
    type: string;
    description: string;
    status: string;
    assignedAgent?: string;
    startTime: Date;
    endTime?: Date;
    result?: any;
    lessons: string[];
}
interface AgentMemory {
    id: string;
    name: string;
    type: string;
    skills: string[];
    performance: {
        tasksCompleted: number;
        successRate: number;
        averageTime: number;
        bestPractices: string[];
        commonIssues: string[];
    };
    preferences: {
        workingStyle: string;
        preferredTools: string[];
        optimizations: string[];
    };
}
interface ConfigurationMemory {
    id: string;
    type: 'mcp_server' | 'database' | 'deployment' | 'security' | 'monitoring';
    name: string;
    config: any;
    status: 'active' | 'inactive' | 'deprecated';
    notes: string;
    lastUsed: Date;
}
interface ConversationMemory {
    id: string;
    timestamp: Date;
    userMessage: string;
    aiResponse: string;
    context: any;
    actionsTaken: string[];
    outcomes: string[];
}
interface LearningMemory {
    id: string;
    category: 'best_practice' | 'solution' | 'pattern' | 'bug_fix' | 'optimization';
    title: string;
    description: string;
    context: string;
    solution: string;
    tags: string[];
    confidence: number;
    timesUsed: number;
    lastUsed: Date;
}
export declare class MemorySystem extends EventEmitter {
    private readonly logger;
    private projectMemory;
    private memoryStore;
    private knowledgeGraph;
    constructor();
    private initializeMemory;
    private initializeKnowledgeBase;
    rememberTask(task: Omit<TaskMemory, 'id'>): Promise<string>;
    rememberConversation(conversation: Omit<ConversationMemory, 'id'>): Promise<string>;
    learnFromExperience(learning: Omit<LearningMemory, 'id' | 'timesUsed' | 'lastUsed'>): Promise<string>;
    rememberConfiguration(config: Omit<ConfigurationMemory, 'id' | 'lastUsed'>): Promise<string>;
    searchKnowledge(query: string, category?: string): Promise<LearningMemory[]>;
    getRelevantExperiences(context: string): Promise<LearningMemory[]>;
    updateAgentPerformance(agentId: string, performance: Partial<AgentMemory['performance']>): Promise<void>;
    private addToKnowledgeGraph;
    private updateMemory;
    getFullMemory(): ProjectMemory;
    getMemoryStats(): any;
    exportMemory(): Promise<string>;
    importMemory(memoryData: string): Promise<void>;
    private rebuildKnowledgeGraph;
}
export {};
