import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import { MCPClient } from '@modelcontextprotocol/sdk';

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

@Injectable()
export class MCPIntegrationManager extends EventEmitter {
  private readonly logger = new Logger(MCPIntegrationManager.name);
  private servers: Map<string, MCPServerConfig> = new Map();
  private clients: Map<string, MCPClient> = new Map();
  private operations: Map<string, MCPOperation> = new Map();
  private stats: Map<string, MCPServerStats> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.logger.log('🔌 MCP INTEGRATION MANAGER - Supreme Connectivity Activated!');
    this.initializeMCPServers();
    this.loadExternalMCPServers();
    this.startHealthMonitoring();
  }

  private initializeMCPServers() {
    // Initialize all standard MCP server configurations
    const defaultServers: MCPServerConfig[] = [
      {
        id: 'github_mcp',
        name: 'GitHub MCP Server',
        command: 'npx',
        args: ['@modelcontextprotocol/server-github'],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || ''
        },
        capabilities: [
          {
            type: 'resources',
            name: 'repository',
            description: 'Access to GitHub repositories',
            required: true
          },
          {
            type: 'tools',
            name: 'create_issue',
            description: 'Create GitHub issues'
          },
          {
            type: 'tools',
            name: 'create_pull_request',
            description: 'Create pull requests'
          },
          {
            type: 'tools',
            name: 'search_repositories',
            description: 'Search GitHub repositories'
          }
        ],
        status: 'disconnected',
        lastConnection: new Date(0),
        errorCount: 0,
        maxRetries: 3
      },
      {
        id: 'slack_mcp',
        name: 'Slack MCP Server',
        command: 'npx',
        args: ['@modelcontextprotocol/server-slack'],
        env: {
          SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || '',
          SLACK_TEAM_ID: process.env.SLACK_TEAM_ID || ''
        },
        capabilities: [
          {
            type: 'tools',
            name: 'send_message',
            description: 'Send messages to Slack channels'
          },
          {
            type: 'tools',
            name: 'list_channels',
            description: 'List available Slack channels'
          },
          {
            type: 'tools',
            name: 'get_channel_history',
            description: 'Get channel message history'
          },
          {
            type: 'resources',
            name: 'channel',
            description: 'Access to Slack channels'
          }
        ],
        status: 'disconnected',
        lastConnection: new Date(0),
        errorCount: 0,
        maxRetries: 3
      },
      {
        id: 'notion_mcp',
        name: 'Notion MCP Server',
        command: 'npx',
        args: ['@modelcontextprotocol/server-notion'],
        env: {
          NOTION_API_KEY: process.env.NOTION_API_KEY || ''
        },
        capabilities: [
          {
            type: 'resources',
            name: 'database',
            description: 'Access to Notion databases'
          },
          {
            type: 'resources',
            name: 'page',
            description: 'Access to Notion pages'
          },
          {
            type: 'tools',
            name: 'create_page',
            description: 'Create new Notion pages'
          },
          {
            type: 'tools',
            name: 'update_page',
            description: 'Update existing Notion pages'
          },
          {
            type: 'tools',
            name: 'query_database',
            description: 'Query Notion databases'
          }
        ],
        status: 'disconnected',
        lastConnection: new Date(0),
        errorCount: 0,
        maxRetries: 3
      },
      {
        id: 'figma_mcp',
        name: 'Figma MCP Server',
        command: 'npx',
        args: ['@modelcontextprotocol/server-figma'],
        env: {
          FIGMA_ACCESS_TOKEN: process.env.FIGMA_ACCESS_TOKEN || ''
        },
        capabilities: [
          {
            type: 'resources',
            name: 'file',
            description: 'Access to Figma files'
          },
          {
            type: 'resources',
            name: 'project',
            description: 'Access to Figma projects'
          },
          {
            type: 'tools',
            name: 'get_file',
            description: 'Get Figma file contents'
          },
          {
            type: 'tools',
            name: 'export_image',
            description: 'Export images from Figma'
          },
          {
            type: 'tools',
            name: 'get_comments',
            description: 'Get file comments'
          }
        ],
        status: 'disconnected',
        lastConnection: new Date(0),
        errorCount: 0,
        maxRetries: 3
      },
      {
        id: 'postgres_mcp',
        name: 'PostgreSQL MCP Server',
        command: 'npx',
        args: ['@modelcontextprotocol/server-postgres'],
        env: {
          DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/torre_suprema'
        },
        capabilities: [
          {
            type: 'resources',
            name: 'schema',
            description: 'Database schema access'
          },
          {
            type: 'tools',
            name: 'query',
            description: 'Execute SQL queries'
          },
          {
            type: 'tools',
            name: 'list_tables',
            description: 'List database tables'
          },
          {
            type: 'tools',
            name: 'describe_table',
            description: 'Describe table structure'
          }
        ],
        status: 'disconnected',
        lastConnection: new Date(0),
        errorCount: 0,
        maxRetries: 3
      },
      {
        id: 'docker_mcp',
        name: 'Docker MCP Server',
        command: 'npx',
        args: ['@modelcontextprotocol/server-docker'],
        capabilities: [
          {
            type: 'tools',
            name: 'list_containers',
            description: 'List Docker containers'
          },
          {
            type: 'tools',
            name: 'container_logs',
            description: 'Get container logs'
          },
          {
            type: 'tools',
            name: 'run_container',
            description: 'Run new container'
          },
          {
            type: 'tools',
            name: 'build_image',
            description: 'Build Docker image'
          }
        ],
        status: 'disconnected',
        lastConnection: new Date(0),
        errorCount: 0,
        maxRetries: 3
      },
      {
        id: 'cloudflare_mcp',
        name: 'Cloudflare MCP Server',
        command: 'npx',
        args: ['@modelcontextprotocol/server-cloudflare'],
        env: {
          CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN || '',
          CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || ''
        },
        capabilities: [
          {
            type: 'resources',
            name: 'zone',
            description: 'Access to DNS zones'
          },
          {
            type: 'tools',
            name: 'manage_dns',
            description: 'Manage DNS records'
          },
          {
            type: 'tools',
            name: 'purge_cache',
            description: 'Purge CDN cache'
          },
          {
            type: 'tools',
            name: 'get_analytics',
            description: 'Get zone analytics'
          }
        ],
        status: 'disconnected',
        lastConnection: new Date(0),
        errorCount: 0,
        maxRetries: 3
      },
      {
        id: 'vercel_mcp',
        name: 'Vercel MCP Server',
        command: 'npx',
        args: ['@modelcontextprotocol/server-vercel'],
        env: {
          VERCEL_ACCESS_TOKEN: process.env.VERCEL_ACCESS_TOKEN || ''
        },
        capabilities: [
          {
            type: 'resources',
            name: 'project',
            description: 'Access to Vercel projects'
          },
          {
            type: 'resources',
            name: 'deployment',
            description: 'Access to deployments'
          },
          {
            type: 'tools',
            name: 'deploy',
            description: 'Deploy projects'
          },
          {
            type: 'tools',
            name: 'get_deployments',
            description: 'List deployments'
          },
          {
            type: 'tools',
            name: 'get_logs',
            description: 'Get deployment logs'
          }
        ],
        status: 'disconnected',
        lastConnection: new Date(0),
        errorCount: 0,
        maxRetries: 3
      }
    ];

    defaultServers.forEach(server => {
      this.servers.set(server.id, server);
      this.stats.set(server.id, {
        serverId: server.id,
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageResponseTime: 0,
        uptime: 0,
        lastHealthCheck: new Date()
      });
    });

    this.logger.log(`🚀 ${defaultServers.length} MCP servers configured and ready for connection`);
  }

  async loadExternalMCPServers(configPath?: string): Promise<void> {
    this.logger.log('🔄 Loading external MCP servers...');
    
    const externalConfigPath = configPath || process.env.EXTERNAL_MCP_CONFIG_PATH || './external-mcp-servers.json';
    
    try {
      const externalServers = await this.loadMCPServerConfigurations(externalConfigPath);
      
      externalServers.forEach(server => {
        this.servers.set(server.id, server);
        this.stats.set(server.id, {
          serverId: server.id,
          totalOperations: 0,
          successfulOperations: 0,
          failedOperations: 0,
          averageResponseTime: 0,
          uptime: 0,
          lastHealthCheck: new Date()
        });
      });
      
      this.logger.log(`✅ Loaded ${externalServers.length} external MCP servers`);
    } catch (error) {
      this.logger.error('❌ Failed to load external MCP servers:', error);
    }
  }

  private async loadMCPServerConfigurations(configPath: string): Promise<MCPServerConfig[]> {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      if (await this.fileExists(configPath)) {
        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        const allServers: MCPServerConfig[] = [];
        
        if (config.checkin_servers) {
          allServers.push(...config.checkin_servers.map(server => ({
            ...server,
            status: 'disconnected' as const,
            lastConnection: new Date(0),
            errorCount: 0,
            maxRetries: 3
          })));
        }
        
        if (config.pdv_servers) {
          allServers.push(...config.pdv_servers.map(server => ({
            ...server,
            status: 'disconnected' as const,
            lastConnection: new Date(0),
            errorCount: 0,
            maxRetries: 3
          })));
        }
        
        if (config.external_servers) {
          allServers.push(...config.external_servers.map(server => ({
            ...server,
            status: 'disconnected' as const,
            lastConnection: new Date(0),
            errorCount: 0,
            maxRetries: 3
          })));
        }
        
        return allServers;
      }
      
      this.logger.warn(`⚠️ External MCP config file not found: ${configPath}`);
      return [];
    } catch (error) {
      this.logger.error(`❌ Error loading MCP configurations from ${configPath}:`, error);
      return [];
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    const fs = require('fs').promises;
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private startHealthMonitoring() {
    // Health check every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000);

    this.logger.log('💓 MCP Health monitoring started');
  }

  async connectAllServers(): Promise<void> {
    this.logger.log('🔌 CONNECTING TO ALL MCP SERVERS - SUPREME INTEGRATION STARTING!');
    
    const connectionPromises = Array.from(this.servers.values()).map(server => 
      this.connectToServer(server.id)
    );

    const results = await Promise.allSettled(connectionPromises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    this.logger.log(`✅ MCP Connection Summary: ${successful} connected, ${failed} failed`);
    
    if (successful > 0) {
      this.logger.log('🎉 TORRE SUPREMA MCP INTEGRATION ACTIVATED!');
      this.emit('allServersConnected', { successful, failed });
    }
  }

  async connectToServer(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId);
    if (!server) {
      this.logger.error(`❌ Server not found: ${serverId}`);
      return false;
    }

    if (server.status === 'connected') {
      this.logger.log(`✅ Server already connected: ${server.name}`);
      return true;
    }

    try {
      this.logger.log(`🔌 Connecting to MCP server: ${server.name}`);
      server.status = 'connecting';

      // Create and configure MCP client
      const client = new MCPClient({
        name: `torre-suprema-${serverId}`,
        version: '1.0.0'
      });

      // Setup server process
      const transport = client.createStdioTransport({
        command: server.command,
        args: server.args,
        env: { ...process.env, ...server.env }
      });

      await client.connect(transport);

      // Initialize client capabilities
      await client.initialize();

      this.clients.set(serverId, client);
      
      server.status = 'connected';
      server.lastConnection = new Date();
      server.errorCount = 0;

      this.logger.log(`✅ Successfully connected to: ${server.name}`);
      
      this.emit('serverConnected', { serverId, serverName: server.name });
      
      // Setup client event handlers
      this.setupClientEventHandlers(client, serverId);
      
      return true;

    } catch (error) {
      this.logger.error(`❌ Failed to connect to ${server.name}:`, error);
      
      server.status = 'error';
      server.errorCount++;
      
      this.emit('serverConnectionFailed', { 
        serverId, 
        serverName: server.name, 
        error: error.message,
        errorCount: server.errorCount
      });

      // Auto-retry if within limits
      if (server.errorCount < server.maxRetries) {
        this.logger.log(`🔄 Scheduling retry for ${server.name} (attempt ${server.errorCount + 1}/${server.maxRetries})`);
        setTimeout(() => this.connectToServer(serverId), 5000 * server.errorCount);
      }
      
      return false;
    }
  }

  private setupClientEventHandlers(client: MCPClient, serverId: string) {
    client.on('error', (error) => {
      this.logger.error(`❌ MCP Client error for ${serverId}:`, error);
      this.handleClientError(serverId, error);
    });

    client.on('close', () => {
      this.logger.warn(`🔌 MCP Client disconnected: ${serverId}`);
      this.handleClientDisconnection(serverId);
    });

    client.on('notification', (notification) => {
      this.logger.log(`📢 MCP Notification from ${serverId}:`, notification);
      this.emit('serverNotification', { serverId, notification });
    });
  }

  private handleClientError(serverId: string, error: any) {
    const server = this.servers.get(serverId);
    if (server) {
      server.status = 'error';
      server.errorCount++;
    }

    this.emit('serverError', { serverId, error });

    // Attempt reconnection
    if (server && server.errorCount < server.maxRetries) {
      setTimeout(() => this.connectToServer(serverId), 10000);
    }
  }

  private handleClientDisconnection(serverId: string) {
    const server = this.servers.get(serverId);
    if (server) {
      server.status = 'disconnected';
    }

    this.clients.delete(serverId);
    this.emit('serverDisconnected', { serverId });

    // Attempt reconnection
    if (server) {
      setTimeout(() => this.connectToServer(serverId), 5000);
    }
  }

  async executeOperation(
    serverId: string, 
    type: 'resource' | 'tool' | 'prompt',
    operation: string, 
    parameters: any = {}
  ): Promise<any> {
    const operationId = `op-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    
    const mcpOperation: MCPOperation = {
      id: operationId,
      serverId,
      type,
      operation,
      parameters,
      status: 'pending',
      startTime: new Date()
    };

    this.operations.set(operationId, mcpOperation);

    try {
      this.logger.log(`⚡ Executing ${type} operation: ${operation} on ${serverId}`);
      mcpOperation.status = 'executing';

      const client = this.clients.get(serverId);
      if (!client) {
        throw new Error(`MCP client not found for server: ${serverId}`);
      }

      let result: any;

      switch (type) {
        case 'resource':
          result = await this.executeResourceOperation(client, operation, parameters);
          break;
        case 'tool':
          result = await this.executeToolOperation(client, operation, parameters);
          break;
        case 'prompt':
          result = await this.executePromptOperation(client, operation, parameters);
          break;
        default:
          throw new Error(`Unknown operation type: ${type}`);
      }

      mcpOperation.status = 'completed';
      mcpOperation.result = result;
      mcpOperation.endTime = new Date();
      mcpOperation.executionTime = mcpOperation.endTime.getTime() - mcpOperation.startTime.getTime();

      // Update server stats
      this.updateServerStats(serverId, true, mcpOperation.executionTime);

      this.logger.log(`✅ Operation completed: ${operation} (${mcpOperation.executionTime}ms)`);
      
      this.emit('operationCompleted', { operation: mcpOperation, result });
      
      return result;

    } catch (error) {
      mcpOperation.status = 'failed';
      mcpOperation.error = error.message;
      mcpOperation.endTime = new Date();
      mcpOperation.executionTime = mcpOperation.endTime.getTime() - mcpOperation.startTime.getTime();

      // Update server stats
      this.updateServerStats(serverId, false, mcpOperation.executionTime);

      this.logger.error(`❌ Operation failed: ${operation}`, error);
      
      this.emit('operationFailed', { operation: mcpOperation, error });
      
      throw error;
    }
  }

  private async executeResourceOperation(client: MCPClient, operation: string, parameters: any): Promise<any> {
    // Execute resource operations
    switch (operation) {
      case 'list':
        return await client.listResources();
      case 'read':
        return await client.readResource(parameters.uri);
      default:
        throw new Error(`Unknown resource operation: ${operation}`);
    }
  }

  private async executeToolOperation(client: MCPClient, operation: string, parameters: any): Promise<any> {
    // Execute tool operations
    const tools = await client.listTools();
    const tool = tools.tools.find(t => t.name === operation);
    
    if (!tool) {
      throw new Error(`Tool not found: ${operation}`);
    }

    return await client.callTool({ name: operation, arguments: parameters });
  }

  private async executePromptOperation(client: MCPClient, operation: string, parameters: any): Promise<any> {
    // Execute prompt operations
    const prompts = await client.listPrompts();
    const prompt = prompts.prompts.find(p => p.name === operation);
    
    if (!prompt) {
      throw new Error(`Prompt not found: ${operation}`);
    }

    return await client.getPrompt({ name: operation, arguments: parameters });
  }

  private updateServerStats(serverId: string, success: boolean, executionTime: number) {
    const stats = this.stats.get(serverId);
    if (!stats) return;

    stats.totalOperations++;
    
    if (success) {
      stats.successfulOperations++;
    } else {
      stats.failedOperations++;
    }

    // Update average response time
    const totalResponseTime = stats.averageResponseTime * (stats.totalOperations - 1) + executionTime;
    stats.averageResponseTime = totalResponseTime / stats.totalOperations;

    stats.lastHealthCheck = new Date();
  }

  private async performHealthChecks() {
    const connectedServers = Array.from(this.servers.values())
      .filter(server => server.status === 'connected');

    for (const server of connectedServers) {
      try {
        const client = this.clients.get(server.id);
        if (client) {
          // Simple ping to check connectivity
          const startTime = Date.now();
          await client.listResources();
          const responseTime = Date.now() - startTime;

          // Update uptime
          const stats = this.stats.get(server.id);
          if (stats) {
            stats.uptime = Date.now() - server.lastConnection.getTime();
            stats.lastHealthCheck = new Date();
          }

          this.emit('healthCheckPassed', { serverId: server.id, responseTime });
        }
      } catch (error) {
        this.logger.warn(`⚠️ Health check failed for ${server.name}:`, error.message);
        this.emit('healthCheckFailed', { serverId: server.id, error: error.message });
        
        // Mark as error and attempt reconnection
        server.status = 'error';
        setTimeout(() => this.connectToServer(server.id), 5000);
      }
    }
  }

  // High-level operations for common tasks
  async createGitHubIssue(title: string, body: string, repository: string): Promise<any> {
    return await this.executeOperation('github_mcp', 'tool', 'create_issue', {
      title,
      body,
      repository
    });
  }

  async sendSlackMessage(channel: string, message: string): Promise<any> {
    return await this.executeOperation('slack_mcp', 'tool', 'send_message', {
      channel,
      text: message
    });
  }

  async createNotionPage(database: string, properties: any): Promise<any> {
    return await this.executeOperation('notion_mcp', 'tool', 'create_page', {
      database,
      properties
    });
  }

  async deployToVercel(projectPath: string): Promise<any> {
    return await this.executeOperation('vercel_mcp', 'tool', 'deploy', {
      path: projectPath
    });
  }

  async queryDatabase(query: string): Promise<any> {
    return await this.executeOperation('postgres_mcp', 'tool', 'query', {
      query
    });
  }

  async runDockerContainer(image: string, options: any = {}): Promise<any> {
    return await this.executeOperation('docker_mcp', 'tool', 'run_container', {
      image,
      ...options
    });
  }

  async manageDNS(zone: string, record: any): Promise<any> {
    return await this.executeOperation('cloudflare_mcp', 'tool', 'manage_dns', {
      zone,
      record
    });
  }

  async getFigmaFile(fileKey: string): Promise<any> {
    return await this.executeOperation('figma_mcp', 'tool', 'get_file', {
      fileKey
    });
  }

  // Batch operations
  async executeBatchOperations(operations: Array<{
    serverId: string;
    type: 'resource' | 'tool' | 'prompt';
    operation: string;
    parameters: any;
  }>): Promise<any[]> {
    this.logger.log(`🔄 Executing ${operations.length} batch operations`);
    
    const promises = operations.map(op => 
      this.executeOperation(op.serverId, op.type, op.operation, op.parameters)
        .catch(error => ({ error: error.message, operation: op }))
    );

    const results = await Promise.allSettled(promises);
    
    this.logger.log(`✅ Batch operations completed: ${results.length} total`);
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : { error: result.reason }
    );
  }

  // Multi-server coordination
  async coordinatedDeployment(projectData: any): Promise<any> {
    this.logger.log('🚀 COORDINATED DEPLOYMENT STARTING - SUPREME AUTOMATION!');
    
    const deploymentTasks = [
      // Build and test
      { serverId: 'github_mcp', type: 'tool' as const, operation: 'trigger_workflow', parameters: { workflow: 'build-and-test' } },
      
      // Deploy to Vercel
      { serverId: 'vercel_mcp', type: 'tool' as const, operation: 'deploy', parameters: projectData },
      
      // Update DNS
      { serverId: 'cloudflare_mcp', type: 'tool' as const, operation: 'manage_dns', parameters: { 
        zone: projectData.domain,
        record: { type: 'CNAME', name: '@', content: projectData.vercelUrl }
      }},
      
      // Notify team
      { serverId: 'slack_mcp', type: 'tool' as const, operation: 'send_message', parameters: {
        channel: '#deployments',
        text: `🚀 ${projectData.name} deployed successfully!`
      }},
      
      // Create deployment record
      { serverId: 'notion_mcp', type: 'tool' as const, operation: 'create_page', parameters: {
        database: 'deployments',
        properties: {
          name: projectData.name,
          status: 'deployed',
          date: new Date().toISOString()
        }
      }}
    ];

    try {
      const results = await this.executeBatchOperations(deploymentTasks);
      
      this.logger.log('✅ COORDINATED DEPLOYMENT COMPLETED SUCCESSFULLY!');
      this.emit('coordinatedDeploymentCompleted', { projectData, results });
      
      return { success: true, results };
      
    } catch (error) {
      this.logger.error('❌ COORDINATED DEPLOYMENT FAILED:', error);
      this.emit('coordinatedDeploymentFailed', { projectData, error });
      
      // Rollback procedures could be implemented here
      return { success: false, error: error.message };
    }
  }

  // Public API Methods
  getServerStatus(serverId: string): MCPServerConfig | undefined {
    return this.servers.get(serverId);
  }

  getAllServers(): MCPServerConfig[] {
    return Array.from(this.servers.values());
  }

  getConnectedServers(): MCPServerConfig[] {
    return Array.from(this.servers.values()).filter(server => server.status === 'connected');
  }

  getServerStats(serverId: string): MCPServerStats | undefined {
    return this.stats.get(serverId);
  }

  getAllStats(): MCPServerStats[] {
    return Array.from(this.stats.values());
  }

  getOperation(operationId: string): MCPOperation | undefined {
    return this.operations.get(operationId);
  }

  getRecentOperations(limit: number = 50): MCPOperation[] {
    return Array.from(this.operations.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  async disconnectServer(serverId: string): Promise<void> {
    const client = this.clients.get(serverId);
    const server = this.servers.get(serverId);
    
    if (client) {
      try {
        await client.close();
        this.clients.delete(serverId);
        this.logger.log(`🔌 Disconnected from server: ${serverId}`);
      } catch (error) {
        this.logger.error(`❌ Error disconnecting from ${serverId}:`, error);
      }
    }
    
    if (server) {
      server.status = 'disconnected';
    }
    
    this.emit('serverDisconnected', { serverId });
  }

  async disconnectAllServers(): Promise<void> {
    this.logger.log('🔌 Disconnecting from all MCP servers...');
    
    const disconnectPromises = Array.from(this.clients.keys()).map(serverId => 
      this.disconnectServer(serverId)
    );
    
    await Promise.allSettled(disconnectPromises);
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    this.logger.log('✅ All MCP servers disconnected');
    this.emit('allServersDisconnected');
  }

  async generateIntegrationReport(): Promise<any> {
    const servers = this.getAllServers();
    const stats = this.getAllStats();
    const recentOperations = this.getRecentOperations(100);
    
    const report = {
      summary: {
        totalServers: servers.length,
        connectedServers: servers.filter(s => s.status === 'connected').length,
        totalOperations: stats.reduce((sum, stat) => sum + stat.totalOperations, 0),
        successRate: stats.reduce((sum, stat) => sum + (stat.successfulOperations / Math.max(stat.totalOperations, 1)), 0) / stats.length,
        averageResponseTime: stats.reduce((sum, stat) => sum + stat.averageResponseTime, 0) / stats.length
      },
      serverDetails: servers.map(server => ({
        id: server.id,
        name: server.name,
        status: server.status,
        capabilities: server.capabilities.length,
        errorCount: server.errorCount,
        lastConnection: server.lastConnection,
        stats: this.getServerStats(server.id)
      })),
      recentActivity: recentOperations.slice(0, 20),
      generatedAt: new Date()
    };
    
    this.emit('integrationReportGenerated', { report });
    return report;
  }
}
