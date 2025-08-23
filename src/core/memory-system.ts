import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class MemorySystem extends EventEmitter {
  private readonly logger = new Logger(MemorySystem.name);
  private projectMemory: ProjectMemory;
  private memoryStore: Map<string, any> = new Map();
  private knowledgeGraph: Map<string, Set<string>> = new Map();

  constructor() {
    super();
    this.logger.log('🧠 Torre Suprema Memory System Activated!');
    this.initializeMemory();
  }

  private initializeMemory() {
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

  private initializeKnowledgeBase() {
    const initialKnowledge: LearningMemory[] = [
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

  async rememberTask(task: Omit<TaskMemory, 'id'>): Promise<string> {
    const taskId = `task-memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const taskMemory: TaskMemory = {
      ...task,
      id: taskId,
      lessons: []
    };

    this.projectMemory.tasks.push(taskMemory);
    this.updateMemory();
    this.logger.log(`💾 Task remembered: ${taskId}`);

    return taskId;
  }

  async rememberConversation(conversation: Omit<ConversationMemory, 'id'>): Promise<string> {
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const conversationMemory: ConversationMemory = {
      ...conversation,
      id: conversationId
    };

    this.projectMemory.conversations.push(conversationMemory);
    this.updateMemory();
    this.logger.log(`🗣️ Conversation remembered: ${conversationId}`);

    return conversationId;
  }

  async learnFromExperience(learning: Omit<LearningMemory, 'id' | 'timesUsed' | 'lastUsed'>): Promise<string> {
    const learningId = `learn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const learningMemory: LearningMemory = {
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

  async rememberConfiguration(config: Omit<ConfigurationMemory, 'id' | 'lastUsed'>): Promise<string> {
    const configId = `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const configMemory: ConfigurationMemory = {
      ...config,
      id: configId,
      lastUsed: new Date()
    };

    this.projectMemory.configurations.push(configMemory);
    this.updateMemory();
    this.logger.log(`⚙️ Configuration remembered: ${config.name}`);

    return configId;
  }

  async searchKnowledge(query: string, category?: string): Promise<LearningMemory[]> {
    const searchTerms = query.toLowerCase().split(' ');
    
    return this.projectMemory.learnings
      .filter(learning => {
        if (category && learning.category !== category) return false;
        
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

  async getRelevantExperiences(context: string): Promise<LearningMemory[]> {
    const contextTerms = context.toLowerCase().split(' ');
    const relevantLearnings: Array<{learning: LearningMemory, relevance: number}> = [];

    this.projectMemory.learnings.forEach(learning => {
      let relevance = 0;
      const learningText = [learning.title, learning.description, learning.context].join(' ').toLowerCase();
      
      contextTerms.forEach(term => {
        if (learningText.includes(term)) {
          relevance += learning.confidence * learning.timesUsed * 0.1;
        }
      });

      if (relevance > 0) {
        relevantLearnings.push({learning, relevance});
      }
    });

    return relevantLearnings
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)
      .map(item => item.learning);
  }

  async updateAgentPerformance(agentId: string, performance: Partial<AgentMemory['performance']>): Promise<void> {
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

  private addToKnowledgeGraph(learning: LearningMemory): void {
    learning.tags.forEach(tag => {
      if (!this.knowledgeGraph.has(tag)) {
        this.knowledgeGraph.set(tag, new Set());
      }
      this.knowledgeGraph.get(tag)!.add(learning.id);
    });
  }

  private updateMemory(): void {
    this.projectMemory.updatedAt = new Date();
    this.emit('memoryUpdated', this.projectMemory);
  }

  getFullMemory(): ProjectMemory {
    return { ...this.projectMemory };
  }

  getMemoryStats(): any {
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

  async exportMemory(): Promise<string> {
    const memoryExport = {
      ...this.projectMemory,
      exportDate: new Date(),
      version: '1.0.0'
    };

    return JSON.stringify(memoryExport, null, 2);
  }

  async importMemory(memoryData: string): Promise<void> {
    try {
      const imported = JSON.parse(memoryData);
      this.projectMemory = { ...imported };
      this.rebuildKnowledgeGraph();
      this.logger.log('📥 Memory successfully imported!');
    } catch (error) {
      this.logger.error('❌ Failed to import memory:', error);
      throw error;
    }
  }

  private rebuildKnowledgeGraph(): void {
    this.knowledgeGraph.clear();
    this.projectMemory.learnings.forEach(learning => {
      this.addToKnowledgeGraph(learning);
    });
  }
}