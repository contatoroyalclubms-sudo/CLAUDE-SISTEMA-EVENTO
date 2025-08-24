/**
 * 🔌 API INTEGRATION AGENT - Torre Suprema
 * Sistema autônomo de auto-configuração de integrações externas
 */

import { TorreAgent } from '../core/simple-orchestrator';
import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Interfaces para integrações de API
export interface APIIntegration {
  id: string;
  name: string;
  type: APIIntegrationType;
  baseUrl: string;
  authentication: APIAuthentication;
  configuration: APIConfiguration;
  status: IntegrationStatus;
  health: APIHealthStatus;
  metadata: APIMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  errorCount: number;
  successCount: number;
}

export interface APIAuthentication {
  type: 'none' | 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth2' | 'custom';
  credentials: { [key: string]: string };
  headers?: { [key: string]: string };
  refreshable?: boolean;
  expiresAt?: Date;
}

export interface APIConfiguration {
  timeout: number;
  retries: number;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  endpoints: APIEndpoint[];
  webhooks?: WebhookConfiguration[];
  healthCheck?: {
    endpoint: string;
    interval: number;
    expectedStatus: number;
  };
}

export interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description?: string;
  parameters?: APIParameter[];
  responseSchema?: any;
  cached?: boolean;
  cacheDuration?: number;
}

export interface APIParameter {
  name: string;
  type: 'query' | 'path' | 'header' | 'body';
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  defaultValue?: any;
}

export interface WebhookConfiguration {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
  };
}

export interface APIMetadata {
  version?: string;
  documentation?: string;
  contact?: string;
  tags?: string[];
  category?: string;
  lastHealthCheck?: Date;
  averageResponseTime?: number;
}

export type APIIntegrationType = 
  | 'rest_api'
  | 'graphql'
  | 'websocket'
  | 'grpc'
  | 'soap'
  | 'webhook';

export type IntegrationStatus = 
  | 'active'
  | 'inactive'
  | 'error'
  | 'configuring'
  | 'testing';

export type APIHealthStatus = 
  | 'healthy'
  | 'degraded'
  | 'unhealthy'
  | 'unknown';

export interface IntegrationTemplate {
  id: string;
  name: string;
  provider: string;
  type: APIIntegrationType;
  baseUrl: string;
  authType: APIAuthentication['type'];
  commonEndpoints: Omit<APIEndpoint, 'id'>[];
  requiredCredentials: string[];
  documentation: string;
  category: string;
}

export interface AutoDiscoveryResult {
  integration: Partial<APIIntegration>;
  confidence: number;
  discoveredEndpoints: APIEndpoint[];
  suggestedAuth: APIAuthentication;
  warnings: string[];
}

export interface IntegrationMetrics {
  totalIntegrations: number;
  activeIntegrations: number;
  healthyIntegrations: number;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  topIntegrations: Array<{
    name: string;
    requests: number;
    successRate: number;
  }>;
}

export class APIIntegrationAgent implements TorreAgent {
  readonly id = 'api-integration-agent';
  readonly name = 'API Integration Agent';
  readonly description = 'Auto-configuração inteligente de integrações externas';
  readonly version = '1.0.0';

  private integrations: Map<string, APIIntegration> = new Map();
  private templates: Map<string, IntegrationTemplate> = new Map();
  private requestCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private rateLimits: Map<string, { requests: number; resetTime: number }> = new Map();
  private integrationsPath: string;
  private healthCheckInterval: NodeJS.Timeout;

  constructor(config?: {
    integrationsPath?: string;
    healthCheckIntervalMs?: number;
  }) {
    this.integrationsPath = config?.integrationsPath || path.join(process.cwd(), '.api-integrations');
    
    this.initializeIntegrationStore();
    this.loadIntegrationTemplates();
    this.loadExistingIntegrations();
    this.startHealthMonitoring(config?.healthCheckIntervalMs || 300000); // 5 minutos

    console.log('🔌 API Integration Agent initialized successfully');
  }

  private initializeIntegrationStore(): void {
    try {
      if (!fs.existsSync(this.integrationsPath)) {
        fs.mkdirSync(this.integrationsPath, { recursive: true });
      }
    } catch (error) {
      console.error('❌ Failed to initialize integration store:', error);
    }
  }

  private loadIntegrationTemplates(): void {
    // Templates para integrações comuns
    const commonTemplates: IntegrationTemplate[] = [
      {
        id: 'stripe',
        name: 'Stripe Payment API',
        provider: 'Stripe',
        type: 'rest_api',
        baseUrl: 'https://api.stripe.com',
        authType: 'bearer_token',
        commonEndpoints: [
          {
            name: 'Create Payment Intent',
            method: 'POST',
            path: '/v1/payment_intents',
            description: 'Create a new payment intent',
            parameters: [
              { name: 'amount', type: 'body', dataType: 'number', required: true },
              { name: 'currency', type: 'body', dataType: 'string', required: true }
            ]
          },
          {
            name: 'Get Customer',
            method: 'GET',
            path: '/v1/customers/{id}',
            description: 'Retrieve a customer',
            parameters: [
              { name: 'id', type: 'path', dataType: 'string', required: true }
            ]
          }
        ],
        requiredCredentials: ['secret_key'],
        documentation: 'https://stripe.com/docs/api',
        category: 'payment'
      },
      {
        id: 'openai',
        name: 'OpenAI API',
        provider: 'OpenAI',
        type: 'rest_api',
        baseUrl: 'https://api.openai.com',
        authType: 'bearer_token',
        commonEndpoints: [
          {
            name: 'Create Completion',
            method: 'POST',
            path: '/v1/chat/completions',
            description: 'Create a chat completion',
            parameters: [
              { name: 'model', type: 'body', dataType: 'string', required: true },
              { name: 'messages', type: 'body', dataType: 'array', required: true }
            ]
          }
        ],
        requiredCredentials: ['api_key'],
        documentation: 'https://platform.openai.com/docs/api-reference',
        category: 'ai'
      },
      {
        id: 'slack',
        name: 'Slack Web API',
        provider: 'Slack',
        type: 'rest_api',
        baseUrl: 'https://slack.com/api',
        authType: 'bearer_token',
        commonEndpoints: [
          {
            name: 'Post Message',
            method: 'POST',
            path: '/chat.postMessage',
            description: 'Send a message to a channel',
            parameters: [
              { name: 'channel', type: 'body', dataType: 'string', required: true },
              { name: 'text', type: 'body', dataType: 'string', required: true }
            ]
          }
        ],
        requiredCredentials: ['bot_token'],
        documentation: 'https://api.slack.com/web',
        category: 'communication'
      },
      {
        id: 'sendgrid',
        name: 'SendGrid Email API',
        provider: 'SendGrid',
        type: 'rest_api',
        baseUrl: 'https://api.sendgrid.com',
        authType: 'bearer_token',
        commonEndpoints: [
          {
            name: 'Send Email',
            method: 'POST',
            path: '/v3/mail/send',
            description: 'Send an email',
            parameters: [
              { name: 'from', type: 'body', dataType: 'object', required: true },
              { name: 'to', type: 'body', dataType: 'array', required: true },
              { name: 'subject', type: 'body', dataType: 'string', required: true }
            ]
          }
        ],
        requiredCredentials: ['api_key'],
        documentation: 'https://docs.sendgrid.com/api-reference',
        category: 'email'
      },
      {
        id: 'github',
        name: 'GitHub API',
        provider: 'GitHub',
        type: 'rest_api',
        baseUrl: 'https://api.github.com',
        authType: 'bearer_token',
        commonEndpoints: [
          {
            name: 'List Repositories',
            method: 'GET',
            path: '/user/repos',
            description: 'List user repositories'
          },
          {
            name: 'Create Issue',
            method: 'POST',
            path: '/repos/{owner}/{repo}/issues',
            description: 'Create a new issue',
            parameters: [
              { name: 'owner', type: 'path', dataType: 'string', required: true },
              { name: 'repo', type: 'path', dataType: 'string', required: true },
              { name: 'title', type: 'body', dataType: 'string', required: true }
            ]
          }
        ],
        requiredCredentials: ['personal_access_token'],
        documentation: 'https://docs.github.com/en/rest',
        category: 'development'
      }
    ];

    commonTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    console.log(`🔌 Loaded ${commonTemplates.length} integration templates`);
  }

  private loadExistingIntegrations(): void {
    try {
      const integrationsFile = path.join(this.integrationsPath, 'integrations.json');
      if (fs.existsSync(integrationsFile)) {
        const integrationsData = JSON.parse(fs.readFileSync(integrationsFile, 'utf8'));
        
        integrationsData.forEach((integration: any) => {
          this.integrations.set(integration.id, {
            ...integration,
            createdAt: new Date(integration.createdAt),
            updatedAt: new Date(integration.updatedAt),
            lastUsed: integration.lastUsed ? new Date(integration.lastUsed) : undefined,
            authentication: {
              ...integration.authentication,
              expiresAt: integration.authentication.expiresAt ? 
                new Date(integration.authentication.expiresAt) : undefined
            }
          });
        });
        
        console.log(`🔌 Loaded ${this.integrations.size} existing integrations`);
      }
    } catch (error) {
      console.error('❌ Failed to load integrations:', error);
    }
  }

  private saveIntegrations(): void {
    try {
      const integrationsFile = path.join(this.integrationsPath, 'integrations.json');
      const integrationsArray = Array.from(this.integrations.values());
      fs.writeFileSync(integrationsFile, JSON.stringify(integrationsArray, null, 2));
    } catch (error) {
      console.error('❌ Failed to save integrations:', error);
    }
  }

  private startHealthMonitoring(intervalMs: number): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, intervalMs);

    // Verificação inicial após 30 segundos
    setTimeout(() => {
      this.performHealthChecks();
    }, 30000);
  }

  private async performHealthChecks(): Promise<void> {
    console.log('🏥 Performing health checks on API integrations...');
    
    for (const integration of this.integrations.values()) {
      if (integration.status === 'active' && integration.configuration.healthCheck) {
        await this.checkIntegrationHealth(integration.id);
      }
    }
  }

  private async checkIntegrationHealth(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (!integration || !integration.configuration.healthCheck) return;

    try {
      const startTime = Date.now();
      const client = this.createHttpClient(integration);
      
      const response = await client.get(integration.configuration.healthCheck.endpoint, {
        timeout: 10000
      });

      const responseTime = Date.now() - startTime;
      const expectedStatus = integration.configuration.healthCheck.expectedStatus || 200;
      
      if (response.status === expectedStatus) {
        integration.health = 'healthy';
        integration.metadata.averageResponseTime = 
          ((integration.metadata.averageResponseTime || 0) + responseTime) / 2;
      } else {
        integration.health = 'degraded';
      }

      integration.metadata.lastHealthCheck = new Date();
      integration.updatedAt = new Date();
      
    } catch (error) {
      integration.health = 'unhealthy';
      integration.errorCount++;
      integration.metadata.lastHealthCheck = new Date();
      integration.updatedAt = new Date();
      
      console.error(`❌ Health check failed for ${integration.name}:`, error);
    }
    
    this.saveIntegrations();
  }

  private createHttpClient(integration: APIIntegration): AxiosInstance {
    const config: AxiosRequestConfig = {
      baseURL: integration.baseUrl,
      timeout: integration.configuration.timeout || 30000,
      headers: {}
    };

    // Configurar autenticação
    switch (integration.authentication.type) {
      case 'api_key':
        if (integration.authentication.credentials.api_key) {
          config.headers!['X-API-Key'] = integration.authentication.credentials.api_key;
        }
        break;
      
      case 'bearer_token':
        if (integration.authentication.credentials.access_token) {
          config.headers!['Authorization'] = `Bearer ${integration.authentication.credentials.access_token}`;
        }
        break;
      
      case 'basic_auth':
        if (integration.authentication.credentials.username && integration.authentication.credentials.password) {
          const auth = Buffer.from(
            `${integration.authentication.credentials.username}:${integration.authentication.credentials.password}`
          ).toString('base64');
          config.headers!['Authorization'] = `Basic ${auth}`;
        }
        break;
    }

    // Adicionar headers personalizados
    if (integration.authentication.headers) {
      Object.assign(config.headers!, integration.authentication.headers);
    }

    const client = axios.create(config);

    // Interceptor para rate limiting
    client.interceptors.request.use(async (config) => {
      await this.checkRateLimit(integration.id);
      return config;
    });

    // Interceptor para logs e métricas
    client.interceptors.response.use(
      (response) => {
        integration.successCount++;
        integration.lastUsed = new Date();
        return response;
      },
      (error) => {
        integration.errorCount++;
        integration.lastUsed = new Date();
        throw error;
      }
    );

    return client;
  }

  private async checkRateLimit(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (!integration) return;

    const rateLimit = integration.configuration.rateLimit;
    if (!rateLimit) return;

    const now = Date.now();
    const rateLimitInfo = this.rateLimits.get(integrationId);

    if (!rateLimitInfo || now >= rateLimitInfo.resetTime) {
      this.rateLimits.set(integrationId, {
        requests: 1,
        resetTime: now + rateLimit.windowMs
      });
    } else if (rateLimitInfo.requests >= rateLimit.requests) {
      const waitTime = rateLimitInfo.resetTime - now;
      console.log(`⏰ Rate limit reached for ${integration.name}, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      this.rateLimits.set(integrationId, {
        requests: 1,
        resetTime: now + waitTime + rateLimit.windowMs
      });
    } else {
      rateLimitInfo.requests++;
    }
  }

  // Auto-discovery de APIs
  async discoverAPI(url: string, options?: {
    authHint?: APIAuthentication['type'];
    credentials?: { [key: string]: string };
  }): Promise<AutoDiscoveryResult> {
    console.log(`🔍 Auto-discovering API at ${url}...`);
    
    const result: AutoDiscoveryResult = {
      integration: {
        baseUrl: url,
        type: 'rest_api',
        status: 'configuring',
        health: 'unknown'
      },
      confidence: 0,
      discoveredEndpoints: [],
      suggestedAuth: { type: 'none', credentials: {} },
      warnings: []
    };

    try {
      // Tentar descobrir esquema OpenAPI/Swagger
      const openApiUrls = [
        `${url}/swagger.json`,
        `${url}/openapi.json`,
        `${url}/api-docs`,
        `${url}/docs/swagger.json`
      ];

      for (const openApiUrl of openApiUrls) {
        try {
          const response = await axios.get(openApiUrl, { timeout: 10000 });
          
          if (response.data && (response.data.swagger || response.data.openapi)) {
            result.confidence += 50;
            const spec = response.data;
            
            // Extrair informações básicas
            result.integration.name = spec.info?.title || 'Discovered API';
            result.integration.metadata = {
              version: spec.info?.version,
              documentation: spec.info?.externalDocs?.url,
              description: spec.info?.description
            };

            // Descobrir endpoints
            if (spec.paths) {
              result.discoveredEndpoints = this.extractEndpointsFromOpenAPI(spec);
              result.confidence += 30;
            }

            // Sugerir autenticação baseada no spec
            if (spec.securityDefinitions || spec.components?.securitySchemes) {
              result.suggestedAuth = this.suggestAuthFromOpenAPI(spec);
              result.confidence += 20;
            }

            break;
          }
        } catch (error) {
          // Ignorar erro e continuar tentando
        }
      }

      // Se não encontrou OpenAPI, fazer descoberta básica
      if (result.confidence === 0) {
        await this.performBasicDiscovery(url, result, options);
      }

    } catch (error) {
      result.warnings.push(`Discovery failed: ${(error as Error).message}`);
    }

    console.log(`🔍 API discovery completed with ${result.confidence}% confidence`);
    return result;
  }

  private extractEndpointsFromOpenAPI(spec: any): APIEndpoint[] {
    const endpoints: APIEndpoint[] = [];
    
    for (const [path, methods] of Object.entries(spec.paths || {})) {
      for (const [method, details] of Object.entries(methods as any)) {
        if (!['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) continue;
        
        const methodDetails = details as any;
        
        endpoints.push({
          id: `${method}_${path}`.replace(/[^a-zA-Z0-9]/g, '_'),
          name: methodDetails.operationId || `${method.toUpperCase()} ${path}`,
          method: method.toUpperCase() as any,
          path: path,
          description: methodDetails.summary || methodDetails.description,
          parameters: this.extractParametersFromOpenAPI(methodDetails.parameters || [])
        });
      }
    }
    
    return endpoints.slice(0, 20); // Limitar a 20 endpoints
  }

  private extractParametersFromOpenAPI(parameters: any[]): APIParameter[] {
    return parameters.map(param => ({
      name: param.name,
      type: param.in as any,
      dataType: param.schema?.type || param.type || 'string',
      required: param.required || false,
      description: param.description
    }));
  }

  private suggestAuthFromOpenAPI(spec: any): APIAuthentication {
    const securitySchemes = spec.components?.securitySchemes || spec.securityDefinitions || {};
    
    for (const [name, scheme] of Object.entries(securitySchemes)) {
      const schemeDetails = scheme as any;
      
      switch (schemeDetails.type) {
        case 'apiKey':
          return {
            type: 'api_key',
            credentials: { api_key: '' },
            headers: schemeDetails.in === 'header' ? { [schemeDetails.name]: '' } : undefined
          };
        
        case 'http':
          if (schemeDetails.scheme === 'bearer') {
            return {
              type: 'bearer_token',
              credentials: { access_token: '' }
            };
          } else if (schemeDetails.scheme === 'basic') {
            return {
              type: 'basic_auth',
              credentials: { username: '', password: '' }
            };
          }
          break;
        
        case 'oauth2':
          return {
            type: 'oauth2',
            credentials: { 
              client_id: '',
              client_secret: '',
              access_token: ''
            },
            refreshable: true
          };
      }
    }
    
    return { type: 'none', credentials: {} };
  }

  private async performBasicDiscovery(
    url: string, 
    result: AutoDiscoveryResult, 
    options?: { authHint?: APIAuthentication['type']; credentials?: { [key: string]: string }; }
  ): Promise<void> {
    try {
      // Testar endpoint básico
      const response = await axios.get(url, { 
        timeout: 10000,
        validateStatus: () => true // Aceitar qualquer status
      });
      
      result.confidence += 20;
      
      // Analisar headers de resposta para descobrir capabilities
      const headers = response.headers;
      
      if (headers['content-type']?.includes('application/json')) {
        result.confidence += 10;
      }
      
      if (headers['x-api-version'] || headers['api-version']) {
        result.integration.metadata = {
          ...result.integration.metadata,
          version: headers['x-api-version'] || headers['api-version']
        };
        result.confidence += 5;
      }
      
      // Se recebeu 401, sugere autenticação
      if (response.status === 401) {
        const wwwAuth = headers['www-authenticate'];
        if (wwwAuth?.toLowerCase().includes('bearer')) {
          result.suggestedAuth = { type: 'bearer_token', credentials: { access_token: '' } };
        } else if (wwwAuth?.toLowerCase().includes('basic')) {
          result.suggestedAuth = { type: 'basic_auth', credentials: { username: '', password: '' } };
        }
        result.confidence += 15;
      }
      
      // Tentar descobrir endpoints comuns
      const commonPaths = ['/health', '/status', '/info', '/version', '/api', '/v1'];
      for (const path of commonPaths) {
        try {
          const pathResponse = await axios.get(`${url}${path}`, { 
            timeout: 5000,
            validateStatus: status => status < 500
          });
          
          if (pathResponse.status < 400) {
            result.discoveredEndpoints.push({
              id: `get_${path.replace(/[^a-zA-Z0-9]/g, '_')}`,
              name: `GET ${path}`,
              method: 'GET',
              path: path,
              description: `Discovered endpoint: ${path}`
            });
            result.confidence += 2;
          }
        } catch (error) {
          // Ignorar erro
        }
      }
      
    } catch (error) {
      result.warnings.push(`Basic discovery failed: ${(error as Error).message}`);
    }
  }

  // Métodos públicos da API
  async createIntegration(data: {
    name: string;
    type?: APIIntegrationType;
    baseUrl: string;
    authentication: APIAuthentication;
    configuration?: Partial<APIConfiguration>;
    metadata?: APIMetadata;
  }): Promise<string> {
    const integrationId = this.generateId();
    
    const integration: APIIntegration = {
      id: integrationId,
      name: data.name,
      type: data.type || 'rest_api',
      baseUrl: data.baseUrl,
      authentication: data.authentication,
      configuration: {
        timeout: 30000,
        retries: 3,
        rateLimit: {
          requests: 1000,
          windowMs: 3600000 // 1 hora
        },
        endpoints: [],
        ...data.configuration
      },
      status: 'configuring',
      health: 'unknown',
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      errorCount: 0,
      successCount: 0
    };
    
    this.integrations.set(integrationId, integration);
    this.saveIntegrations();
    
    console.log(`🆕 API integration created: ${data.name}`);
    
    // Testar conexão automaticamente
    setTimeout(() => {
      this.testIntegration(integrationId);
    }, 1000);
    
    return integrationId;
  }

  async createFromTemplate(templateId: string, credentials: { [key: string]: string }): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    // Verificar se todas as credenciais necessárias foram fornecidas
    for (const requiredCred of template.requiredCredentials) {
      if (!credentials[requiredCred]) {
        throw new Error(`Missing required credential: ${requiredCred}`);
      }
    }
    
    const authentication: APIAuthentication = {
      type: template.authType,
      credentials
    };
    
    const integrationId = await this.createIntegration({
      name: template.name,
      type: template.type,
      baseUrl: template.baseUrl,
      authentication,
      configuration: {
        endpoints: template.commonEndpoints.map((endpoint, index) => ({
          ...endpoint,
          id: `${templateId}_${index}`
        }))
      },
      metadata: {
        documentation: template.documentation,
        category: template.category,
        version: '1.0.0'
      }
    });
    
    console.log(`🎯 Integration created from template: ${template.name}`);
    return integrationId;
  }

  async testIntegration(integrationId: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration not found: ${integrationId}`);
    }
    
    console.log(`🧪 Testing integration: ${integration.name}`);
    
    try {
      integration.status = 'testing';
      
      const client = this.createHttpClient(integration);
      
      // Tentar endpoint de health check se disponível
      if (integration.configuration.healthCheck) {
        await client.get(integration.configuration.healthCheck.endpoint);
      } else {
        // Fazer uma requisição básica
        await client.get('/', { timeout: 10000 });
      }
      
      integration.status = 'active';
      integration.health = 'healthy';
      integration.updatedAt = new Date();
      
      this.saveIntegrations();
      
      console.log(`✅ Integration test successful: ${integration.name}`);
      return true;
      
    } catch (error) {
      integration.status = 'error';
      integration.health = 'unhealthy';
      integration.errorCount++;
      integration.updatedAt = new Date();
      
      this.saveIntegrations();
      
      console.error(`❌ Integration test failed: ${integration.name}`, error);
      return false;
    }
  }

  async makeRequest(integrationId: string, endpointId: string, parameters?: { [key: string]: any }): Promise<any> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration not found: ${integrationId}`);
    }
    
    if (integration.status !== 'active') {
      throw new Error(`Integration is not active: ${integration.status}`);
    }
    
    const endpoint = integration.configuration.endpoints.find(ep => ep.id === endpointId);
    if (!endpoint) {
      throw new Error(`Endpoint not found: ${endpointId}`);
    }
    
    // Verificar cache se habilitado
    if (endpoint.cached && endpoint.method === 'GET') {
      const cacheKey = `${integrationId}_${endpointId}_${JSON.stringify(parameters)}`;
      const cached = this.requestCache.get(cacheKey);
      
      if (cached && Date.now() < cached.timestamp + cached.ttl) {
        console.log(`📋 Cache hit for ${integration.name}/${endpoint.name}`);
        return cached.data;
      }
    }
    
    const client = this.createHttpClient(integration);
    let path = endpoint.path;
    const requestConfig: AxiosRequestConfig = {
      method: endpoint.method.toLowerCase() as any,
      headers: {},
      params: {},
      data: undefined
    };
    
    // Processar parâmetros
    if (parameters && endpoint.parameters) {
      for (const param of endpoint.parameters) {
        const value = parameters[param.name];
        if (value === undefined && param.required) {
          throw new Error(`Missing required parameter: ${param.name}`);
        }
        
        if (value !== undefined) {
          switch (param.type) {
            case 'path':
              path = path.replace(`{${param.name}}`, encodeURIComponent(String(value)));
              break;
            case 'query':
              requestConfig.params![param.name] = value;
              break;
            case 'header':
              requestConfig.headers![param.name] = String(value);
              break;
            case 'body':
              if (!requestConfig.data) {
                requestConfig.data = {};
              }
              requestConfig.data[param.name] = value;
              break;
          }
        }
      }
    }
    
    try {
      console.log(`📡 Making API request: ${endpoint.method} ${path}`);
      const response = await client.request({
        ...requestConfig,
        url: path
      });
      
      // Cache response se habilitado
      if (endpoint.cached && endpoint.method === 'GET') {
        const cacheKey = `${integrationId}_${endpointId}_${JSON.stringify(parameters)}`;
        const ttl = (endpoint.cacheDuration || 300) * 1000; // Default 5 minutos
        
        this.requestCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
          ttl
        });
        
        // Limpar cache antigo
        this.cleanCache();
      }
      
      return response.data;
      
    } catch (error: any) {
      console.error(`❌ API request failed for ${integration.name}/${endpoint.name}:`, error);
      throw error;
    }
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.requestCache.entries()) {
      if (now >= cached.timestamp + cached.ttl) {
        this.requestCache.delete(key);
      }
    }
  }

  async updateIntegration(integrationId: string, updates: Partial<APIIntegration>): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) return false;
    
    Object.assign(integration, updates, { updatedAt: new Date() });
    this.saveIntegrations();
    
    console.log(`📝 Integration updated: ${integration.name}`);
    return true;
  }

  async deleteIntegration(integrationId: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) return false;
    
    this.integrations.delete(integrationId);
    this.saveIntegrations();
    
    console.log(`🗑️ Integration deleted: ${integration.name}`);
    return true;
  }

  listIntegrations(filter?: {
    status?: IntegrationStatus;
    type?: APIIntegrationType;
    category?: string;
  }): APIIntegration[] {
    return Array.from(this.integrations.values()).filter(integration => {
      if (filter?.status && integration.status !== filter.status) return false;
      if (filter?.type && integration.type !== filter.type) return false;
      if (filter?.category && integration.metadata.category !== filter.category) return false;
      return true;
    });
  }

  listTemplates(): IntegrationTemplate[] {
    return Array.from(this.templates.values());
  }

  getIntegrationMetrics(): IntegrationMetrics {
    const integrations = Array.from(this.integrations.values());
    
    const totalRequests = integrations.reduce((sum, i) => sum + i.successCount + i.errorCount, 0);
    const totalSuccesses = integrations.reduce((sum, i) => sum + i.successCount, 0);
    
    const topIntegrations = integrations
      .map(integration => ({
        name: integration.name,
        requests: integration.successCount + integration.errorCount,
        successRate: integration.successCount + integration.errorCount > 0 ?
          integration.successCount / (integration.successCount + integration.errorCount) : 0
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5);
    
    return {
      totalIntegrations: integrations.length,
      activeIntegrations: integrations.filter(i => i.status === 'active').length,
      healthyIntegrations: integrations.filter(i => i.health === 'healthy').length,
      totalRequests,
      successRate: totalRequests > 0 ? totalSuccesses / totalRequests : 0,
      averageResponseTime: integrations.reduce((sum, i) => 
        sum + (i.metadata.averageResponseTime || 0), 0) / integrations.length || 0,
      topIntegrations
    };
  }

  private generateId(): string {
    return `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // TorreAgent implementation
  async processTask(task: any): Promise<any> {
    try {
      switch (task.action) {
        case 'create_integration':
          return await this.createIntegration(task.data);
        
        case 'create_from_template':
          return await this.createFromTemplate(task.data.templateId, task.data.credentials);
        
        case 'discover_api':
          return await this.discoverAPI(task.data.url, task.data.options);
        
        case 'test_integration':
          return await this.testIntegration(task.data.id);
        
        case 'make_request':
          return await this.makeRequest(task.data.integrationId, task.data.endpointId, task.data.parameters);
        
        case 'update_integration':
          return await this.updateIntegration(task.data.id, task.data.updates);
        
        case 'delete_integration':
          return await this.deleteIntegration(task.data.id);
        
        case 'list_integrations':
          return this.listIntegrations(task.data.filter);
        
        case 'list_templates':
          return this.listTemplates();
        
        case 'get_metrics':
          return this.getIntegrationMetrics();
        
        case 'health_check':
          await this.performHealthChecks();
          return { success: true };
        
        default:
          throw new Error(`Unknown task action: ${task.action}`);
      }
    } catch (error: any) {
      console.error(`❌ API Integration Agent task failed:`, error);
      throw error;
    }
  }

  getStatus() {
    const metrics = this.getIntegrationMetrics();
    
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      status: 'active',
      metrics,
      capabilities: [
        'Auto API discovery',
        'Template-based integration',
        'Health monitoring',
        'Rate limiting',
        'Response caching',
        'Authentication management'
      ]
    };
  }

  // Cleanup resources
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Export singleton instance
export const apiIntegrationAgent = new APIIntegrationAgent();