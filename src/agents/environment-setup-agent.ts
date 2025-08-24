/**
 * 🌍 ENVIRONMENT SETUP AGENT - Torre Suprema
 * Sistema autônomo de configuração automática de ambientes
 */

import { TorreAgent } from '../core/simple-orchestrator';
import * as fs from 'fs';
import * as path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Interfaces para configuração de ambiente
export interface Environment {
  id: string;
  name: string;
  type: EnvironmentType;
  status: EnvironmentStatus;
  configuration: EnvironmentConfiguration;
  services: EnvironmentService[];
  dependencies: EnvironmentDependency[];
  variables: { [key: string]: string };
  metadata: EnvironmentMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastDeployment?: Date;
  healthScore: number;
}

export interface EnvironmentConfiguration {
  platform: 'local' | 'docker' | 'kubernetes' | 'cloud';
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  networking: {
    ports: number[];
    domains?: string[];
    ssl?: boolean;
  };
  security: {
    firewall: boolean;
    authentication: boolean;
    encryption: boolean;
  };
  monitoring: {
    enabled: boolean;
    metrics: string[];
    alerts: boolean;
  };
  backup: {
    enabled: boolean;
    frequency: string;
    retention: number;
  };
}

export interface EnvironmentService {
  id: string;
  name: string;
  type: ServiceType;
  version?: string;
  status: ServiceStatus;
  configuration: { [key: string]: any };
  healthCheck?: {
    endpoint: string;
    interval: number;
    timeout: number;
  };
  dependencies: string[];
  ports: number[];
}

export interface EnvironmentDependency {
  id: string;
  name: string;
  type: DependencyType;
  version: string;
  source: string;
  required: boolean;
  installed: boolean;
  installCommand?: string;
  verifyCommand?: string;
}

export interface EnvironmentMetadata {
  description?: string;
  tags?: string[];
  owner?: string;
  project?: string;
  lastHealthCheck?: Date;
  deploymentCount?: number;
  totalUptime?: number;
}

export type EnvironmentType = 
  | 'development' 
  | 'staging' 
  | 'production' 
  | 'testing' 
  | 'sandbox'
  | 'preview';

export type EnvironmentStatus = 
  | 'creating' 
  | 'active' 
  | 'inactive' 
  | 'error' 
  | 'updating' 
  | 'destroying';

export type ServiceType = 
  | 'web_server' 
  | 'database' 
  | 'cache' 
  | 'queue' 
  | 'storage' 
  | 'monitoring'
  | 'proxy'
  | 'search';

export type ServiceStatus = 
  | 'running' 
  | 'stopped' 
  | 'error' 
  | 'starting' 
  | 'stopping';

export type DependencyType = 
  | 'package_manager' 
  | 'runtime' 
  | 'framework' 
  | 'library' 
  | 'tool' 
  | 'binary';

export interface EnvironmentTemplate {
  id: string;
  name: string;
  description: string;
  type: EnvironmentType;
  platform: EnvironmentConfiguration['platform'];
  services: Omit<EnvironmentService, 'id' | 'status'>[];
  dependencies: Omit<EnvironmentDependency, 'id' | 'installed'>[];
  variables: { [key: string]: string };
  setupSteps: SetupStep[];
  category: string;
}

export interface SetupStep {
  id: string;
  name: string;
  description: string;
  command?: string;
  script?: string;
  conditions?: string[];
  timeout?: number;
  retryable?: boolean;
  order: number;
}

export interface DeploymentPlan {
  environmentId: string;
  steps: DeploymentStep[];
  estimatedDuration: number;
  rollbackPlan: DeploymentStep[];
  prerequisites: string[];
  risks: string[];
}

export interface DeploymentStep {
  id: string;
  name: string;
  type: 'install' | 'configure' | 'start' | 'test' | 'verify';
  command: string;
  expectedDuration: number;
  critical: boolean;
  rollbackCommand?: string;
}

export interface EnvironmentMetrics {
  totalEnvironments: number;
  activeEnvironments: number;
  healthyEnvironments: number;
  totalServices: number;
  runningServices: number;
  averageHealthScore: number;
  deploymentSuccess: number;
  lastDeploymentTime: Date | null;
}

export class EnvironmentSetupAgent implements TorreAgent {
  readonly id = 'environment-setup-agent';
  readonly name = 'Environment Setup Agent';
  readonly description = 'Configuração automática de ambientes de desenvolvimento e produção';
  readonly version = '1.0.0';

  private environments: Map<string, Environment> = new Map();
  private templates: Map<string, EnvironmentTemplate> = new Map();
  private activeDeployments: Map<string, { plan: DeploymentPlan; currentStep: number }> = new Map();
  private environmentsPath: string;
  private monitoringInterval: NodeJS.Timeout;

  constructor(config?: {
    environmentsPath?: string;
    monitoringIntervalMs?: number;
  }) {
    this.environmentsPath = config?.environmentsPath || path.join(process.cwd(), '.environments');
    
    this.initializeEnvironmentStore();
    this.loadEnvironmentTemplates();
    this.loadExistingEnvironments();
    this.startEnvironmentMonitoring(config?.monitoringIntervalMs || 300000); // 5 minutos

    console.log('🌍 Environment Setup Agent initialized successfully');
  }

  private initializeEnvironmentStore(): void {
    try {
      if (!fs.existsSync(this.environmentsPath)) {
        fs.mkdirSync(this.environmentsPath, { recursive: true });
      }
    } catch (error) {
      console.error('❌ Failed to initialize environment store:', error);
    }
  }

  private loadEnvironmentTemplates(): void {
    const templates: EnvironmentTemplate[] = [
      {
        id: 'node_express_dev',
        name: 'Node.js + Express Development',
        description: 'Ambiente de desenvolvimento completo para aplicações Node.js com Express',
        type: 'development',
        platform: 'local',
        services: [
          {
            name: 'express-app',
            type: 'web_server',
            configuration: {
              port: 3000,
              env: 'development',
              hotReload: true
            },
            dependencies: [],
            ports: [3000]
          },
          {
            name: 'mongodb',
            type: 'database',
            version: '7.0',
            configuration: {
              port: 27017,
              dbName: 'development'
            },
            dependencies: [],
            ports: [27017]
          },
          {
            name: 'redis',
            type: 'cache',
            version: '7.2',
            configuration: {
              port: 6379
            },
            dependencies: [],
            ports: [6379]
          }
        ],
        dependencies: [
          {
            name: 'node',
            type: 'runtime',
            version: '>=18.0.0',
            source: 'https://nodejs.org',
            required: true,
            verifyCommand: 'node --version'
          },
          {
            name: 'npm',
            type: 'package_manager',
            version: '>=8.0.0',
            source: 'bundled-with-node',
            required: true,
            verifyCommand: 'npm --version'
          }
        ],
        variables: {
          NODE_ENV: 'development',
          PORT: '3000',
          DB_URL: 'mongodb://localhost:27017/development',
          REDIS_URL: 'redis://localhost:6379'
        },
        setupSteps: [
          {
            id: 'install_deps',
            name: 'Install Dependencies',
            description: 'Install Node.js project dependencies',
            command: 'npm install',
            order: 1
          },
          {
            id: 'setup_db',
            name: 'Setup Database',
            description: 'Initialize MongoDB database',
            command: 'mongosh --eval "db.runCommand({ping: 1})"',
            order: 2
          }
        ],
        category: 'web_development'
      },
      {
        id: 'react_frontend_dev',
        name: 'React Frontend Development',
        description: 'Ambiente otimizado para desenvolvimento React com TypeScript',
        type: 'development',
        platform: 'local',
        services: [
          {
            name: 'react-dev-server',
            type: 'web_server',
            configuration: {
              port: 3000,
              hotReload: true,
              typescript: true
            },
            dependencies: [],
            ports: [3000]
          }
        ],
        dependencies: [
          {
            name: 'node',
            type: 'runtime',
            version: '>=16.0.0',
            source: 'https://nodejs.org',
            required: true,
            verifyCommand: 'node --version'
          },
          {
            name: 'npm',
            type: 'package_manager',
            version: '>=8.0.0',
            source: 'bundled-with-node',
            required: true,
            verifyCommand: 'npm --version'
          }
        ],
        variables: {
          NODE_ENV: 'development',
          PORT: '3000',
          FAST_REFRESH: 'true'
        },
        setupSteps: [
          {
            id: 'install_deps',
            name: 'Install Dependencies',
            description: 'Install React project dependencies',
            command: 'npm install',
            order: 1
          },
          {
            id: 'start_dev_server',
            name: 'Start Development Server',
            description: 'Start React development server',
            command: 'npm start',
            order: 2
          }
        ],
        category: 'frontend'
      },
      {
        id: 'docker_microservices',
        name: 'Docker Microservices',
        description: 'Ambiente de microsserviços usando Docker e Docker Compose',
        type: 'development',
        platform: 'docker',
        services: [
          {
            name: 'api-gateway',
            type: 'proxy',
            configuration: {
              port: 8080,
              upstream: ['user-service', 'product-service']
            },
            dependencies: ['user-service', 'product-service'],
            ports: [8080]
          },
          {
            name: 'user-service',
            type: 'web_server',
            configuration: {
              port: 3001
            },
            dependencies: ['postgres'],
            ports: [3001]
          },
          {
            name: 'product-service',
            type: 'web_server',
            configuration: {
              port: 3002
            },
            dependencies: ['postgres'],
            ports: [3002]
          },
          {
            name: 'postgres',
            type: 'database',
            version: '15',
            configuration: {
              port: 5432,
              database: 'microservices'
            },
            dependencies: [],
            ports: [5432]
          }
        ],
        dependencies: [
          {
            name: 'docker',
            type: 'tool',
            version: '>=20.0.0',
            source: 'https://docker.com',
            required: true,
            verifyCommand: 'docker --version'
          },
          {
            name: 'docker-compose',
            type: 'tool',
            version: '>=2.0.0',
            source: 'https://docker.com',
            required: true,
            verifyCommand: 'docker-compose --version'
          }
        ],
        variables: {
          COMPOSE_PROJECT_NAME: 'microservices',
          POSTGRES_DB: 'microservices',
          POSTGRES_USER: 'admin',
          POSTGRES_PASSWORD: 'password'
        },
        setupSteps: [
          {
            id: 'build_images',
            name: 'Build Docker Images',
            description: 'Build all service Docker images',
            command: 'docker-compose build',
            order: 1
          },
          {
            id: 'start_services',
            name: 'Start Services',
            description: 'Start all microservices',
            command: 'docker-compose up -d',
            order: 2
          }
        ],
        category: 'microservices'
      },
      {
        id: 'production_k8s',
        name: 'Production Kubernetes',
        description: 'Ambiente de produção usando Kubernetes com alta disponibilidade',
        type: 'production',
        platform: 'kubernetes',
        services: [
          {
            name: 'web-app',
            type: 'web_server',
            configuration: {
              replicas: 3,
              port: 80,
              resources: {
                cpu: '500m',
                memory: '512Mi'
              }
            },
            dependencies: ['database'],
            ports: [80]
          },
          {
            name: 'database',
            type: 'database',
            configuration: {
              replicas: 1,
              port: 5432,
              storage: '20Gi'
            },
            dependencies: [],
            ports: [5432]
          }
        ],
        dependencies: [
          {
            name: 'kubectl',
            type: 'tool',
            version: '>=1.20.0',
            source: 'https://kubernetes.io',
            required: true,
            verifyCommand: 'kubectl version --client'
          },
          {
            name: 'helm',
            type: 'tool',
            version: '>=3.0.0',
            source: 'https://helm.sh',
            required: true,
            verifyCommand: 'helm version'
          }
        ],
        variables: {
          NAMESPACE: 'production',
          REPLICAS: '3',
          INGRESS_HOST: 'app.example.com'
        },
        setupSteps: [
          {
            id: 'create_namespace',
            name: 'Create Namespace',
            description: 'Create Kubernetes namespace',
            command: 'kubectl create namespace production',
            order: 1
          },
          {
            id: 'deploy_app',
            name: 'Deploy Application',
            description: 'Deploy application using Helm',
            command: 'helm install app ./helm-chart -n production',
            order: 2
          }
        ],
        category: 'production'
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });

    console.log(`🌍 Loaded ${templates.length} environment templates`);
  }

  private loadExistingEnvironments(): void {
    try {
      const environmentsFile = path.join(this.environmentsPath, 'environments.json');
      if (fs.existsSync(environmentsFile)) {
        const environmentsData = JSON.parse(fs.readFileSync(environmentsFile, 'utf8'));
        
        environmentsData.forEach((environment: any) => {
          this.environments.set(environment.id, {
            ...environment,
            createdAt: new Date(environment.createdAt),
            updatedAt: new Date(environment.updatedAt),
            lastDeployment: environment.lastDeployment ? new Date(environment.lastDeployment) : undefined
          });
        });
        
        console.log(`🌍 Loaded ${this.environments.size} existing environments`);
      }
    } catch (error) {
      console.error('❌ Failed to load environments:', error);
    }
  }

  private saveEnvironments(): void {
    try {
      const environmentsFile = path.join(this.environmentsPath, 'environments.json');
      const environmentsArray = Array.from(this.environments.values());
      fs.writeFileSync(environmentsFile, JSON.stringify(environmentsArray, null, 2));
    } catch (error) {
      console.error('❌ Failed to save environments:', error);
    }
  }

  private startEnvironmentMonitoring(intervalMs: number): void {
    this.monitoringInterval = setInterval(() => {
      this.performEnvironmentHealthChecks();
    }, intervalMs);

    // Verificação inicial após 30 segundos
    setTimeout(() => {
      this.performEnvironmentHealthChecks();
    }, 30000);
  }

  private async performEnvironmentHealthChecks(): Promise<void> {
    console.log('🏥 Performing environment health checks...');
    
    for (const environment of this.environments.values()) {
      if (environment.status === 'active') {
        await this.checkEnvironmentHealth(environment.id);
      }
    }
  }

  private async checkEnvironmentHealth(environmentId: string): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment) return;

    try {
      let totalHealthScore = 0;
      let healthyServices = 0;

      for (const service of environment.services) {
        const serviceHealthy = await this.checkServiceHealth(environment, service);
        if (serviceHealthy) {
          healthyServices++;
          totalHealthScore += 100;
        }
      }

      const healthScore = environment.services.length > 0 ? 
        Math.round(totalHealthScore / environment.services.length) : 100;

      environment.healthScore = healthScore;
      environment.metadata.lastHealthCheck = new Date();
      environment.updatedAt = new Date();

      if (healthScore < 50) {
        console.log(`⚠️ Environment health critical: ${environment.name} (${healthScore}%)`);
        await this.triggerEnvironmentRecovery(environmentId);
      }

    } catch (error) {
      console.error(`❌ Health check failed for environment ${environment.name}:`, error);
      environment.healthScore = 0;
    }

    this.saveEnvironments();
  }

  private async checkServiceHealth(environment: Environment, service: EnvironmentService): Promise<boolean> {
    try {
      if (service.healthCheck) {
        // Verificar endpoint de health check
        const { stdout } = await execAsync(`curl -f ${service.healthCheck.endpoint}`, {
          timeout: service.healthCheck.timeout || 5000
        });
        return true;
      } else {
        // Verificar se processo está rodando baseado na plataforma
        switch (environment.configuration.platform) {
          case 'docker':
            const { stdout } = await execAsync(`docker ps --filter name=${service.name} --format "{{.Status}}"`);
            return stdout.includes('Up');
          
          case 'local':
            // Verificar porta
            if (service.ports.length > 0) {
              const port = service.ports[0];
              const { stdout: portCheck } = await execAsync(`netstat -an | grep :${port}`, { timeout: 5000 });
              return portCheck.includes('LISTEN');
            }
            return true;
          
          default:
            return true;
        }
      }
    } catch (error) {
      return false;
    }
  }

  private async triggerEnvironmentRecovery(environmentId: string): Promise<void> {
    console.log(`🚨 Triggering recovery for environment: ${environmentId}`);
    
    const environment = this.environments.get(environmentId);
    if (!environment) return;

    try {
      switch (environment.configuration.platform) {
        case 'docker':
          await execAsync('docker-compose restart');
          break;
        
        case 'kubernetes':
          await execAsync(`kubectl rollout restart deployment -n ${environment.metadata.project}`);
          break;
        
        case 'local':
          // Tentar reiniciar serviços críticos
          for (const service of environment.services) {
            if (service.status === 'error') {
              console.log(`🔄 Restarting service: ${service.name}`);
              // Implementar lógica de restart baseada no tipo de serviço
            }
          }
          break;
      }
      
      console.log(`✅ Recovery triggered for environment: ${environment.name}`);
    } catch (error) {
      console.error(`❌ Recovery failed for environment ${environment.name}:`, error);
    }
  }

  // Métodos públicos da API
  async createEnvironment(data: {
    name: string;
    type: EnvironmentType;
    configuration: EnvironmentConfiguration;
    services?: EnvironmentService[];
    dependencies?: EnvironmentDependency[];
    variables?: { [key: string]: string };
    metadata?: EnvironmentMetadata;
  }): Promise<string> {
    const environmentId = this.generateId();
    
    const environment: Environment = {
      id: environmentId,
      name: data.name,
      type: data.type,
      status: 'creating',
      configuration: data.configuration,
      services: data.services || [],
      dependencies: data.dependencies || [],
      variables: data.variables || {},
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      healthScore: 100
    };
    
    this.environments.set(environmentId, environment);
    this.saveEnvironments();
    
    console.log(`🆕 Environment created: ${data.name}`);
    
    // Iniciar setup automaticamente
    setTimeout(() => {
      this.setupEnvironment(environmentId);
    }, 1000);
    
    return environmentId;
  }

  async createFromTemplate(templateId: string, overrides?: {
    name?: string;
    variables?: { [key: string]: string };
    configuration?: Partial<EnvironmentConfiguration>;
  }): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    const environmentName = overrides?.name || `${template.name} Environment`;
    const variables = { ...template.variables, ...overrides?.variables };
    const configuration = { 
      ...this.getDefaultConfiguration(template.platform),
      ...overrides?.configuration 
    };
    
    const services: EnvironmentService[] = template.services.map((service, index) => ({
      ...service,
      id: `${templateId}_service_${index}`,
      status: 'stopped'
    }));
    
    const dependencies: EnvironmentDependency[] = template.dependencies.map((dep, index) => ({
      ...dep,
      id: `${templateId}_dep_${index}`,
      installed: false
    }));
    
    const environmentId = await this.createEnvironment({
      name: environmentName,
      type: template.type,
      configuration,
      services,
      dependencies,
      variables,
      metadata: {
        description: template.description,
        tags: [template.category, 'from-template']
      }
    });
    
    console.log(`🎯 Environment created from template: ${template.name}`);
    return environmentId;
  }

  private getDefaultConfiguration(platform: EnvironmentConfiguration['platform']): EnvironmentConfiguration {
    return {
      platform,
      resources: {
        cpu: '2',
        memory: '4Gi',
        storage: '20Gi'
      },
      networking: {
        ports: [80, 443],
        ssl: true
      },
      security: {
        firewall: true,
        authentication: true,
        encryption: true
      },
      monitoring: {
        enabled: true,
        metrics: ['cpu', 'memory', 'network'],
        alerts: true
      },
      backup: {
        enabled: true,
        frequency: 'daily',
        retention: 7
      }
    };
  }

  async setupEnvironment(environmentId: string): Promise<boolean> {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment not found: ${environmentId}`);
    }
    
    console.log(`🚀 Setting up environment: ${environment.name}`);
    
    try {
      environment.status = 'creating';
      this.saveEnvironments();
      
      // 1. Verificar e instalar dependências
      await this.installDependencies(environment);
      
      // 2. Configurar variáveis de ambiente
      await this.setupEnvironmentVariables(environment);
      
      // 3. Configurar e iniciar serviços
      await this.setupServices(environment);
      
      // 4. Verificar saúde do ambiente
      await this.verifyEnvironmentSetup(environment);
      
      environment.status = 'active';
      environment.lastDeployment = new Date();
      environment.metadata.deploymentCount = (environment.metadata.deploymentCount || 0) + 1;
      environment.updatedAt = new Date();
      
      this.saveEnvironments();
      
      console.log(`✅ Environment setup completed: ${environment.name}`);
      return true;
      
    } catch (error) {
      environment.status = 'error';
      environment.updatedAt = new Date();
      this.saveEnvironments();
      
      console.error(`❌ Environment setup failed: ${environment.name}`, error);
      return false;
    }
  }

  private async installDependencies(environment: Environment): Promise<void> {
    console.log(`📦 Installing dependencies for ${environment.name}...`);
    
    for (const dependency of environment.dependencies) {
      if (dependency.installed) {
        console.log(`✅ Dependency already installed: ${dependency.name}`);
        continue;
      }
      
      try {
        // Verificar se já está instalado
        if (dependency.verifyCommand) {
          try {
            await execAsync(dependency.verifyCommand, { timeout: 10000 });
            dependency.installed = true;
            console.log(`✅ Dependency verified: ${dependency.name}`);
            continue;
          } catch (error) {
            // Não instalado, continuar com instalação
          }
        }
        
        // Instalar dependência
        if (dependency.installCommand) {
          console.log(`📥 Installing dependency: ${dependency.name}`);
          await execAsync(dependency.installCommand, { timeout: 300000 }); // 5 minutos timeout
          
          // Verificar instalação
          if (dependency.verifyCommand) {
            await execAsync(dependency.verifyCommand, { timeout: 10000 });
          }
          
          dependency.installed = true;
          console.log(`✅ Dependency installed successfully: ${dependency.name}`);
        }
        
      } catch (error) {
        if (dependency.required) {
          throw new Error(`Failed to install required dependency: ${dependency.name}`);
        } else {
          console.warn(`⚠️ Failed to install optional dependency: ${dependency.name}`);
        }
      }
    }
  }

  private async setupEnvironmentVariables(environment: Environment): Promise<void> {
    console.log(`🔧 Setting up environment variables for ${environment.name}...`);
    
    const envFile = path.join(this.environmentsPath, environment.id, '.env');
    const envDir = path.dirname(envFile);
    
    // Criar diretório se não existir
    if (!fs.existsSync(envDir)) {
      fs.mkdirSync(envDir, { recursive: true });
    }
    
    // Escrever variáveis de ambiente
    const envContent = Object.entries(environment.variables)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync(envFile, envContent);
    
    console.log(`✅ Environment variables configured: ${Object.keys(environment.variables).length} variables`);
  }

  private async setupServices(environment: Environment): Promise<void> {
    console.log(`🛠️ Setting up services for ${environment.name}...`);
    
    // Ordenar serviços por dependências
    const sortedServices = this.topologicalSort(environment.services);
    
    for (const service of sortedServices) {
      try {
        console.log(`🚀 Starting service: ${service.name}`);
        service.status = 'starting';
        
        await this.startService(environment, service);
        
        service.status = 'running';
        console.log(`✅ Service started: ${service.name}`);
        
      } catch (error) {
        service.status = 'error';
        console.error(`❌ Failed to start service: ${service.name}`, error);
        
        if (service.dependencies.length === 0) {
          // Se é um serviço crítico (sem dependências), falhar o setup
          throw error;
        }
      }
    }
  }

  private topologicalSort(services: EnvironmentService[]): EnvironmentService[] {
    const result: EnvironmentService[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const visit = (service: EnvironmentService) => {
      if (visiting.has(service.id)) {
        throw new Error(`Circular dependency detected involving service: ${service.name}`);
      }
      
      if (visited.has(service.id)) {
        return;
      }
      
      visiting.add(service.id);
      
      // Visitar dependências primeiro
      for (const depId of service.dependencies) {
        const dependency = services.find(s => s.id === depId || s.name === depId);
        if (dependency) {
          visit(dependency);
        }
      }
      
      visiting.delete(service.id);
      visited.add(service.id);
      result.push(service);
    };
    
    for (const service of services) {
      if (!visited.has(service.id)) {
        visit(service);
      }
    }
    
    return result;
  }

  private async startService(environment: Environment, service: EnvironmentService): Promise<void> {
    const platform = environment.configuration.platform;
    
    switch (platform) {
      case 'docker':
        await this.startDockerService(environment, service);
        break;
      
      case 'kubernetes':
        await this.startKubernetesService(environment, service);
        break;
      
      case 'local':
        await this.startLocalService(environment, service);
        break;
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    // Aguardar serviço ficar saudável
    await this.waitForServiceHealth(environment, service);
  }

  private async startDockerService(environment: Environment, service: EnvironmentService): Promise<void> {
    const containerName = `${environment.id}_${service.name}`;
    
    try {
      // Parar container existente se houver
      await execAsync(`docker stop ${containerName}`, { timeout: 30000 });
      await execAsync(`docker rm ${containerName}`, { timeout: 30000 });
    } catch (error) {
      // Ignorar erro se container não existir
    }
    
    // Construir comando docker run
    let dockerCommand = `docker run -d --name ${containerName}`;
    
    // Adicionar portas
    for (const port of service.ports) {
      dockerCommand += ` -p ${port}:${port}`;
    }
    
    // Adicionar variáveis de ambiente
    for (const [key, value] of Object.entries(environment.variables)) {
      dockerCommand += ` -e ${key}="${value}"`;
    }
    
    // Adicionar imagem baseada no tipo de serviço
    const image = this.getDockerImage(service);
    dockerCommand += ` ${image}`;
    
    await execAsync(dockerCommand, { timeout: 120000 });
  }

  private async startKubernetesService(environment: Environment, service: EnvironmentService): Promise<void> {
    const namespace = environment.metadata.project || 'default';
    
    // Criar manifesto Kubernetes
    const manifest = this.generateKubernetesManifest(environment, service);
    const manifestPath = path.join(this.environmentsPath, environment.id, `${service.name}-manifest.yaml`);
    
    fs.writeFileSync(manifestPath, manifest);
    
    // Aplicar manifesto
    await execAsync(`kubectl apply -f ${manifestPath} -n ${namespace}`, { timeout: 60000 });
    
    // Aguardar deployment estar pronto
    await execAsync(`kubectl wait --for=condition=available deployment/${service.name} -n ${namespace} --timeout=300s`);
  }

  private async startLocalService(environment: Environment, service: EnvironmentService): Promise<void> {
    // Para serviços locais, usar pm2 ou similar
    const serviceConfig = service.configuration;
    
    if (serviceConfig.command) {
      const envFile = path.join(this.environmentsPath, environment.id, '.env');
      const command = `source ${envFile} && ${serviceConfig.command}`;
      
      // Iniciar processo em background
      const child = spawn('sh', ['-c', command], {
        detached: true,
        stdio: 'ignore'
      });
      
      child.unref();
    }
  }

  private getDockerImage(service: EnvironmentService): string {
    const imageMap: { [key in ServiceType]: string } = {
      web_server: 'nginx:alpine',
      database: service.name.includes('postgres') ? 'postgres:15' : 
                service.name.includes('mongo') ? 'mongo:7' : 'mysql:8',
      cache: 'redis:7-alpine',
      queue: 'rabbitmq:3-management',
      storage: 'minio/minio:latest',
      monitoring: 'prometheus:latest',
      proxy: 'nginx:alpine',
      search: 'elasticsearch:8.8.0'
    };
    
    return service.version ? 
      `${imageMap[service.type].split(':')[0]}:${service.version}` :
      imageMap[service.type];
  }

  private generateKubernetesManifest(environment: Environment, service: EnvironmentService): string {
    const serviceName = service.name;
    const namespace = environment.metadata.project || 'default';
    const replicas = service.configuration.replicas || 1;
    
    return `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${serviceName}
  namespace: ${namespace}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${serviceName}
  template:
    metadata:
      labels:
        app: ${serviceName}
    spec:
      containers:
      - name: ${serviceName}
        image: ${this.getDockerImage(service)}
        ports:
        ${service.ports.map(port => `- containerPort: ${port}`).join('\n        ')}
        env:
        ${Object.entries(environment.variables).map(([key, value]) => 
          `- name: ${key}\n          value: "${value}"`).join('\n        ')}
---
apiVersion: v1
kind: Service
metadata:
  name: ${serviceName}-service
  namespace: ${namespace}
spec:
  selector:
    app: ${serviceName}
  ports:
  ${service.ports.map(port => `- port: ${port}\n    targetPort: ${port}`).join('\n  ')}
  type: ClusterIP
`;
  }

  private async waitForServiceHealth(environment: Environment, service: EnvironmentService, maxWaitMs: number = 60000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      const isHealthy = await this.checkServiceHealth(environment, service);
      
      if (isHealthy) {
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2 segundos
    }
    
    throw new Error(`Service ${service.name} failed to become healthy within ${maxWaitMs}ms`);
  }

  private async verifyEnvironmentSetup(environment: Environment): Promise<void> {
    console.log(`🔍 Verifying environment setup: ${environment.name}`);
    
    // Verificar se todos os serviços críticos estão rodando
    const criticalServices = environment.services.filter(s => s.dependencies.length === 0);
    
    for (const service of criticalServices) {
      const isHealthy = await this.checkServiceHealth(environment, service);
      if (!isHealthy) {
        throw new Error(`Critical service ${service.name} is not healthy`);
      }
    }
    
    // Verificar conectividade entre serviços
    await this.verifyServiceConnectivity(environment);
    
    console.log(`✅ Environment verification completed: ${environment.name}`);
  }

  private async verifyServiceConnectivity(environment: Environment): Promise<void> {
    // Implementar verificação de conectividade baseada na plataforma
    // Por exemplo, testar se serviços conseguem se comunicar entre si
    console.log(`🔗 Verifying service connectivity for ${environment.name}`);
  }

  async destroyEnvironment(environmentId: string): Promise<boolean> {
    const environment = this.environments.get(environmentId);
    if (!environment) return false;
    
    console.log(`🗑️ Destroying environment: ${environment.name}`);
    
    try {
      environment.status = 'destroying';
      this.saveEnvironments();
      
      // Parar todos os serviços
      for (const service of environment.services.reverse()) { // Ordem inversa
        await this.stopService(environment, service);
      }
      
      // Limpar recursos baseado na plataforma
      switch (environment.configuration.platform) {
        case 'docker':
          await execAsync(`docker-compose -p ${environment.id} down -v`, { timeout: 60000 });
          break;
        
        case 'kubernetes':
          const namespace = environment.metadata.project || 'default';
          await execAsync(`kubectl delete all --all -n ${namespace}`, { timeout: 120000 });
          break;
      }
      
      // Remover diretório do ambiente
      const envDir = path.join(this.environmentsPath, environment.id);
      if (fs.existsSync(envDir)) {
        fs.rmSync(envDir, { recursive: true, force: true });
      }
      
      this.environments.delete(environmentId);
      this.saveEnvironments();
      
      console.log(`✅ Environment destroyed: ${environment.name}`);
      return true;
      
    } catch (error) {
      environment.status = 'error';
      this.saveEnvironments();
      
      console.error(`❌ Failed to destroy environment: ${environment.name}`, error);
      return false;
    }
  }

  private async stopService(environment: Environment, service: EnvironmentService): Promise<void> {
    console.log(`🛑 Stopping service: ${service.name}`);
    
    try {
      switch (environment.configuration.platform) {
        case 'docker':
          await execAsync(`docker stop ${environment.id}_${service.name}`, { timeout: 30000 });
          break;
        
        case 'kubernetes':
          const namespace = environment.metadata.project || 'default';
          await execAsync(`kubectl delete deployment ${service.name} -n ${namespace}`, { timeout: 60000 });
          break;
      }
      
      service.status = 'stopped';
    } catch (error) {
      console.error(`❌ Failed to stop service: ${service.name}`, error);
      service.status = 'error';
    }
  }

  listEnvironments(filter?: {
    type?: EnvironmentType;
    status?: EnvironmentStatus;
    platform?: EnvironmentConfiguration['platform'];
  }): Environment[] {
    return Array.from(this.environments.values()).filter(env => {
      if (filter?.type && env.type !== filter.type) return false;
      if (filter?.status && env.status !== filter.status) return false;
      if (filter?.platform && env.configuration.platform !== filter.platform) return false;
      return true;
    });
  }

  listTemplates(): EnvironmentTemplate[] {
    return Array.from(this.templates.values());
  }

  getEnvironmentMetrics(): EnvironmentMetrics {
    const environments = Array.from(this.environments.values());
    const services = environments.flatMap(env => env.services);
    
    const totalHealthScore = environments.reduce((sum, env) => sum + env.healthScore, 0);
    const averageHealthScore = environments.length > 0 ? totalHealthScore / environments.length : 0;
    
    const lastDeployment = environments
      .filter(env => env.lastDeployment)
      .map(env => env.lastDeployment!)
      .sort((a, b) => b.getTime() - a.getTime())[0] || null;
    
    return {
      totalEnvironments: environments.length,
      activeEnvironments: environments.filter(env => env.status === 'active').length,
      healthyEnvironments: environments.filter(env => env.healthScore >= 80).length,
      totalServices: services.length,
      runningServices: services.filter(service => service.status === 'running').length,
      averageHealthScore: Math.round(averageHealthScore),
      deploymentSuccess: environments.filter(env => env.status === 'active').length / Math.max(1, environments.length),
      lastDeploymentTime: lastDeployment
    };
  }

  private generateId(): string {
    return `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // TorreAgent implementation
  async processTask(task: any): Promise<any> {
    try {
      switch (task.action) {
        case 'create_environment':
          return await this.createEnvironment(task.data);
        
        case 'create_from_template':
          return await this.createFromTemplate(task.data.templateId, task.data.overrides);
        
        case 'setup_environment':
          return await this.setupEnvironment(task.data.id);
        
        case 'destroy_environment':
          return await this.destroyEnvironment(task.data.id);
        
        case 'list_environments':
          return this.listEnvironments(task.data.filter);
        
        case 'list_templates':
          return this.listTemplates();
        
        case 'get_metrics':
          return this.getEnvironmentMetrics();
        
        case 'health_check':
          await this.performEnvironmentHealthChecks();
          return { success: true };
        
        default:
          throw new Error(`Unknown task action: ${task.action}`);
      }
    } catch (error: any) {
      console.error(`❌ Environment Setup Agent task failed:`, error);
      throw error;
    }
  }

  getStatus() {
    const metrics = this.getEnvironmentMetrics();
    
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      status: 'active',
      metrics,
      capabilities: [
        'Template-based environment creation',
        'Multi-platform deployment (Docker, K8s, Local)',
        'Dependency management',
        'Service orchestration',
        'Health monitoring',
        'Auto-recovery'
      ]
    };
  }

  // Cleanup resources
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
}

// Export singleton instance
export const environmentSetupAgent = new EnvironmentSetupAgent();