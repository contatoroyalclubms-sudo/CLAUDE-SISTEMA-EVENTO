/**
 * 🏗️ TORRE SUPREMA PROJECT INTEGRATOR
 * Sistema para integrar outros projetos com os agentes da Torre Suprema
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ExternalProject {
  id: string;
  name: string;
  path: string;
  type: 'nodejs' | 'react' | 'python' | 'dotnet' | 'php' | 'java' | 'generic';
  status: 'active' | 'inactive' | 'error';
  agents: string[]; // Quais agentes podem trabalhar neste projeto
  technologies: string[];
  lastAccessed: Date;
  configuration: ProjectConfiguration;
}

export interface ProjectConfiguration {
  buildCommand?: string;
  testCommand?: string;
  startCommand?: string;
  deployCommand?: string;
  dependencies?: string[];
  environmentVars?: { [key: string]: string };
  gitRepo?: string;
  documentation?: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  agentType: string;
  description: string;
  command?: string;
  expectedOutput?: string;
  workingDirectory: string;
  environment?: { [key: string]: string };
}

export class TorreSupremaProjectIntegrator {
  private projects: Map<string, ExternalProject> = new Map();
  private activeProjects: Set<string> = new Set();

  constructor() {
    console.log('🏗️ Torre Suprema Project Integrator INITIALIZED');
    this.loadExistingProjects();
  }

  // 📁 INTEGRAÇÃO DE PROJETOS
  async integrateProject(projectPath: string, projectName?: string): Promise<string> {
    console.log(`🔗 Integrando projeto: ${projectPath}`);

    if (!fs.existsSync(projectPath)) {
      throw new Error(`Projeto não encontrado: ${projectPath}`);
    }

    const projectId = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const detectedType = await this.detectProjectType(projectPath);
    const config = await this.detectProjectConfiguration(projectPath, detectedType);

    const project: ExternalProject = {
      id: projectId,
      name: projectName || path.basename(projectPath),
      path: projectPath,
      type: detectedType,
      status: 'active',
      agents: this.getCompatibleAgents(detectedType),
      technologies: await this.detectTechnologies(projectPath),
      lastAccessed: new Date(),
      configuration: config
    };

    this.projects.set(projectId, project);
    this.activeProjects.add(projectId);

    console.log(`✅ Projeto integrado: ${project.name} (${project.type})`);
    console.log(`🤖 Agentes compatíveis: ${project.agents.join(', ')}`);

    return projectId;
  }

  private async detectProjectType(projectPath: string): Promise<ExternalProject['type']> {
    const files = fs.readdirSync(projectPath);

    // Node.js / React
    if (files.includes('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
      if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
        return 'react';
      }
      return 'nodejs';
    }

    // Python
    if (files.includes('requirements.txt') || files.includes('setup.py') || files.includes('pyproject.toml')) {
      return 'python';
    }

    // .NET
    if (files.some(file => file.endsWith('.csproj') || file.endsWith('.sln'))) {
      return 'dotnet';
    }

    // PHP
    if (files.includes('composer.json') || files.some(file => file.endsWith('.php'))) {
      return 'php';
    }

    // Java
    if (files.includes('pom.xml') || files.includes('build.gradle')) {
      return 'java';
    }

    return 'generic';
  }

  private async detectProjectConfiguration(projectPath: string, type: ExternalProject['type']): Promise<ProjectConfiguration> {
    const config: ProjectConfiguration = {};

    try {
      switch (type) {
        case 'nodejs':
        case 'react':
          const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
          config.buildCommand = packageJson.scripts?.build ? 'npm run build' : undefined;
          config.testCommand = packageJson.scripts?.test ? 'npm run test' : undefined;
          config.startCommand = packageJson.scripts?.start ? 'npm start' : packageJson.scripts?.dev ? 'npm run dev' : undefined;
          config.dependencies = Object.keys({...packageJson.dependencies, ...packageJson.devDependencies});
          break;

        case 'python':
          config.buildCommand = 'python setup.py build';
          config.testCommand = 'python -m pytest';
          config.startCommand = 'python main.py';
          if (fs.existsSync(path.join(projectPath, 'requirements.txt'))) {
            config.dependencies = fs.readFileSync(path.join(projectPath, 'requirements.txt'), 'utf8').split('\n').filter(line => line.trim());
          }
          break;

        case 'dotnet':
          config.buildCommand = 'dotnet build';
          config.testCommand = 'dotnet test';
          config.startCommand = 'dotnet run';
          break;

        case 'php':
          config.testCommand = 'phpunit';
          config.startCommand = 'php -S localhost:8000';
          break;

        case 'java':
          if (fs.existsSync(path.join(projectPath, 'pom.xml'))) {
            config.buildCommand = 'mvn compile';
            config.testCommand = 'mvn test';
            config.startCommand = 'mvn exec:java';
          } else {
            config.buildCommand = 'gradle build';
            config.testCommand = 'gradle test';
            config.startCommand = 'gradle run';
          }
          break;
      }

      // Detectar Git
      if (fs.existsSync(path.join(projectPath, '.git'))) {
        try {
          const gitConfig = fs.readFileSync(path.join(projectPath, '.git/config'), 'utf8');
          const repoMatch = gitConfig.match(/url = (.+)/);
          if (repoMatch) {
            config.gitRepo = repoMatch[1];
          }
        } catch (error) {
          // Ignore git config errors
        }
      }

    } catch (error) {
      console.warn(`⚠️ Erro ao detectar configuração: ${error}`);
    }

    return config;
  }

  private async detectTechnologies(projectPath: string): Promise<string[]> {
    const technologies: Set<string> = new Set();
    const files = fs.readdirSync(projectPath);

    // Detectar baseado em arquivos
    if (files.includes('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
      const deps = {...packageJson.dependencies, ...packageJson.devDependencies};
      
      if (deps.react) technologies.add('React');
      if (deps.vue) technologies.add('Vue');
      if (deps.angular) technologies.add('Angular');
      if (deps.express) technologies.add('Express');
      if (deps.fastify) technologies.add('Fastify');
      if (deps.next) technologies.add('Next.js');
      if (deps.typescript) technologies.add('TypeScript');
      if (deps.tailwindcss) technologies.add('TailwindCSS');
      if (deps.prisma) technologies.add('Prisma');
      if (deps.mongoose) technologies.add('MongoDB');
      technologies.add('Node.js');
    }

    // Detectar por extensões de arquivo
    const walkDir = (dir: string) => {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items.slice(0, 50)) { // Limitar para performance
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && !item.includes('node_modules')) {
            walkDir(fullPath);
          } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            switch (ext) {
              case '.ts': technologies.add('TypeScript'); break;
              case '.py': technologies.add('Python'); break;
              case '.cs': technologies.add('C#'); break;
              case '.php': technologies.add('PHP'); break;
              case '.java': technologies.add('Java'); break;
              case '.cpp': case '.cc': technologies.add('C++'); break;
              case '.go': technologies.add('Go'); break;
              case '.rs': technologies.add('Rust'); break;
              case '.vue': technologies.add('Vue'); break;
              case '.jsx': case '.tsx': technologies.add('React'); break;
            }
          }
        }
      } catch (error) {
        // Ignore permission errors
      }
    };

    walkDir(projectPath);

    return Array.from(technologies);
  }

  private getCompatibleAgents(projectType: ExternalProject['type']): string[] {
    const agentCompatibility = {
      'nodejs': ['backend-dev-001', 'general-purpose-001'],
      'react': ['frontend-dev-001', 'general-purpose-001'],
      'python': ['backend-dev-001', 'data-analyst-001', 'general-purpose-001'],
      'dotnet': ['backend-dev-001', 'general-purpose-001'],
      'php': ['backend-dev-001', 'general-purpose-001'],
      'java': ['backend-dev-001', 'general-purpose-001'],
      'generic': ['general-purpose-001']
    };

    return agentCompatibility[projectType] || ['general-purpose-001'];
  }

  // 🎯 EXECUÇÃO DE TAREFAS EM PROJETOS
  async executeProjectTask(projectId: string, agentType: string, taskDescription: string): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Projeto não encontrado: ${projectId}`);
    }

    if (!project.agents.includes(agentType)) {
      throw new Error(`Agente ${agentType} não é compatível com projeto ${project.name}`);
    }

    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    console.log(`🚀 Executando tarefa no projeto ${project.name}`);
    console.log(`📋 Tarefa: ${taskDescription}`);
    console.log(`🤖 Agente: ${agentType}`);
    console.log(`📁 Diretório: ${project.path}`);

    // Criar contexto da tarefa
    const taskContext = {
      projectPath: project.path,
      projectName: project.name,
      projectType: project.type,
      technologies: project.technologies,
      configuration: project.configuration,
      taskDescription: taskDescription
    };

    // Simular execução (integração real seria com o orchestrator)
    project.lastAccessed = new Date();
    
    return taskId;
  }

  // 📊 GESTÃO DE PROJETOS
  getIntegratedProjects(): ExternalProject[] {
    return Array.from(this.projects.values());
  }

  getProjectById(projectId: string): ExternalProject | undefined {
    return this.projects.get(projectId);
  }

  getProjectsByTechnology(technology: string): ExternalProject[] {
    return Array.from(this.projects.values()).filter(project => 
      project.technologies.includes(technology)
    );
  }

  getProjectsByType(type: ExternalProject['type']): ExternalProject[] {
    return Array.from(this.projects.values()).filter(project => project.type === type);
  }

  // 🔄 COMANDOS AUTOMÁTICOS
  async runProjectCommand(projectId: string, command: 'build' | 'test' | 'start' | 'deploy'): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Projeto não encontrado: ${projectId}`);
    }

    let commandToRun: string | undefined;
    
    switch (command) {
      case 'build':
        commandToRun = project.configuration.buildCommand;
        break;
      case 'test':
        commandToRun = project.configuration.testCommand;
        break;
      case 'start':
        commandToRun = project.configuration.startCommand;
        break;
      case 'deploy':
        commandToRun = project.configuration.deployCommand;
        break;
    }

    if (!commandToRun) {
      throw new Error(`Comando ${command} não configurado para projeto ${project.name}`);
    }

    console.log(`⚡ Executando: ${commandToRun} em ${project.path}`);
    
    // Aqui seria a integração real com o sistema de execução
    // Por enquanto é simulado
    const result = `Comando "${commandToRun}" executado com sucesso em ${project.name}`;
    
    return result;
  }

  // 💾 PERSISTÊNCIA
  private loadExistingProjects(): void {
    // Simular carregamento de projetos persistidos
    console.log('📂 Carregando projetos existentes...');
  }

  saveProjectConfiguration(): void {
    const projectData = {
      projects: Array.from(this.projects.values()),
      timestamp: new Date().toISOString()
    };

    // Salvar configuração (simulado)
    console.log('💾 Configuração de projetos salva');
  }

  // 📋 RELATÓRIOS
  getIntegrationReport() {
    const projects = Array.from(this.projects.values());
    
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      projectTypes: this.getProjectTypeDistribution(projects),
      technologies: this.getTechnologyDistribution(projects),
      agentUsage: this.getAgentUsageStats(projects),
      lastActivity: projects.length > 0 ? Math.max(...projects.map(p => p.lastAccessed.getTime())) : 0,
      timestamp: new Date()
    };
  }

  private getProjectTypeDistribution(projects: ExternalProject[]) {
    const distribution: { [key: string]: number } = {};
    projects.forEach(project => {
      distribution[project.type] = (distribution[project.type] || 0) + 1;
    });
    return distribution;
  }

  private getTechnologyDistribution(projects: ExternalProject[]) {
    const distribution: { [key: string]: number } = {};
    projects.forEach(project => {
      project.technologies.forEach(tech => {
        distribution[tech] = (distribution[tech] || 0) + 1;
      });
    });
    return distribution;
  }

  private getAgentUsageStats(projects: ExternalProject[]) {
    const usage: { [key: string]: number } = {};
    projects.forEach(project => {
      project.agents.forEach(agent => {
        usage[agent] = (usage[agent] || 0) + 1;
      });
    });
    return usage;
  }
}