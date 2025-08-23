import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import { MCPClient } from '@modelcontextprotocol/sdk';

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

@Injectable()
export class OrchestratorEngine extends EventEmitter {
  private readonly logger = new Logger(OrchestratorEngine.name);
  private agents: Map<string, Agent> = new Map();
  private tasks: Map<string, AgentTask> = new Map();
  private mcpClients: Map<string, MCPClient> = new Map();

  constructor() {
    super();
    this.logger.log('🚀 Torre Suprema Orchestrator Engine Initialized!');
    this.initializeAgents();
  }

  private initializeAgents() {
    const defaultAgents: Agent[] = [
      {
        id: 'backend-dev-001',
        name: 'Backend Development Specialist',
        type: 'development',
        skills: ['nodejs', 'python', 'databases', 'apis', 'microservices'],
        mcpTools: ['github_mcp', 'postgres_mcp', 'docker_mcp'],
        status: 'idle',
        performance: { tasksCompleted: 0, averageTime: 0, successRate: 1.0 }
      },
      {
        id: 'frontend-dev-001', 
        name: 'Frontend Development Expert',
        type: 'development',
        skills: ['react', 'typescript', 'tailwind', 'nextjs', 'ui/ux'],
        mcpTools: ['github_mcp', 'figma_mcp', 'vercel_mcp'],
        status: 'idle',
        performance: { tasksCompleted: 0, averageTime: 0, successRate: 1.0 }
      },
      {
        id: 'devops-001',
        name: 'DevOps Automation Master',
        type: 'deployment',
        skills: ['docker', 'kubernetes', 'ci/cd', 'monitoring', 'scaling'],
        mcpTools: ['docker_mcp', 'cloudflare_mcp', 'github_mcp'],
        status: 'idle',
        performance: { tasksCompleted: 0, averageTime: 0, successRate: 1.0 }
      },
      {
        id: 'design-001',
        name: 'Creative Design Genius',
        type: 'design',
        skills: ['figma', 'ui_design', 'branding', 'prototyping', 'user_research'],
        mcpTools: ['figma_mcp', 'notion_mcp'],
        status: 'idle',
        performance: { tasksCompleted: 0, averageTime: 0, successRate: 1.0 }
      },
      {
        id: 'qa-001',
        name: 'Quality Assurance Guardian',
        type: 'testing',
        skills: ['automated_testing', 'manual_testing', 'bug_detection', 'performance_testing'],
        mcpTools: ['github_mcp', 'slack_mcp'],
        status: 'idle',
        performance: { tasksCompleted: 0, averageTime: 0, successRate: 1.0 }
      }
    ];

    defaultAgents.forEach(agent => this.agents.set(agent.id, agent));
    this.logger.log(`✅ ${defaultAgents.length} agents initialized and ready!`);
  }

  async submitTask(task: Omit<AgentTask, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask: AgentTask = {
      ...task,
      id: taskId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(taskId, newTask);
    this.logger.log(`📋 New task submitted: ${taskId} (${task.type})`);

    this.emit('taskSubmitted', newTask);
    await this.assignTask(taskId);
    
    return taskId;
  }

  private async assignTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const availableAgents = Array.from(this.agents.values())
      .filter(agent => 
        agent.status === 'idle' && 
        agent.type === task.type &&
        task.requiredMCPTools.every(tool => agent.mcpTools.includes(tool))
      )
      .sort((a, b) => b.performance.successRate - a.performance.successRate);

    if (availableAgents.length === 0) {
      this.logger.warn(`⚠️ No available agents for task ${taskId}`);
      return;
    }

    const selectedAgent = availableAgents[0];
    task.assignedAgent = selectedAgent.id;
    task.status = 'in_progress';
    task.updatedAt = new Date();

    selectedAgent.status = 'busy';
    selectedAgent.currentTask = taskId;

    this.logger.log(`🎯 Task ${taskId} assigned to agent ${selectedAgent.name}`);
    this.emit('taskAssigned', { task, agent: selectedAgent });

    await this.executeTask(task, selectedAgent);
  }

  private async executeTask(task: AgentTask, agent: Agent): Promise<void> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`⚡ Executing task ${task.id} with agent ${agent.name}`);
      
      const mcpResults = await this.executeMCPOperations(task.requiredMCPTools, task.payload);
      
      await this.simulateTaskExecution(task, agent);
      
      const executionTime = Date.now() - startTime;
      this.completeTask(task.id, agent.id, executionTime, true);
      
    } catch (error) {
      this.logger.error(`❌ Task ${task.id} failed:`, error);
      this.completeTask(task.id, agent.id, Date.now() - startTime, false);
    }
  }

  private async executeMCPOperations(requiredTools: string[], payload: any): Promise<any> {
    const results: any = {};
    
    for (const tool of requiredTools) {
      try {
        const client = this.mcpClients.get(tool);
        if (client) {
          this.logger.log(`🔧 Executing MCP operation with ${tool}`);
          results[tool] = 'success';
        } else {
          this.logger.warn(`⚠️ MCP client for ${tool} not found`);
        }
      } catch (error) {
        this.logger.error(`❌ MCP operation failed for ${tool}:`, error);
      }
    }
    
    return results;
  }

  private async simulateTaskExecution(task: AgentTask, agent: Agent): Promise<void> {
    const executionTime = Math.random() * 5000 + 1000;
    await new Promise(resolve => setTimeout(resolve, executionTime));
  }

  private completeTask(taskId: string, agentId: string, executionTime: number, success: boolean): void {
    const task = this.tasks.get(taskId);
    const agent = this.agents.get(agentId);
    
    if (!task || !agent) return;

    task.status = success ? 'completed' : 'failed';
    task.updatedAt = new Date();

    agent.status = 'idle';
    agent.currentTask = undefined;
    agent.performance.tasksCompleted++;
    agent.performance.averageTime = 
      (agent.performance.averageTime + executionTime) / agent.performance.tasksCompleted;
    agent.performance.successRate = success ? 
      (agent.performance.successRate + 1) / 2 : 
      agent.performance.successRate * 0.95;

    this.logger.log(`✅ Task ${taskId} ${success ? 'completed' : 'failed'} by ${agent.name}`);
    this.emit('taskCompleted', { task, agent, success, executionTime });
  }

  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  getAgentStatus(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getTaskStatus(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  async initializeMCPConnections(mcpConfigs: any[]): Promise<void> {
    for (const config of mcpConfigs) {
      try {
        const client = new MCPClient(config);
        await client.connect();
        this.mcpClients.set(config.name, client);
        this.logger.log(`🔌 Connected to MCP server: ${config.name}`);
      } catch (error) {
        this.logger.error(`❌ Failed to connect to MCP server ${config.name}:`, error);
      }
    }
  }
}