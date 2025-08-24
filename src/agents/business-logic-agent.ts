/**
 * 🧠 BUSINESS LOGIC AGENT - Torre Suprema
 * Sistema autônomo de tomada de decisões inteligentes de negócio
 */

import { TorreAgent } from '../core/simple-orchestrator';
import * as fs from 'fs';
import * as path from 'path';

// Interfaces para decisões de negócio
export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  category: BusinessRuleCategory;
  conditions: BusinessCondition[];
  actions: BusinessAction[];
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  executionCount: number;
  lastExecuted?: Date;
}

export interface BusinessCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface BusinessAction {
  type: BusinessActionType;
  target: string;
  parameters: { [key: string]: any };
}

export type BusinessRuleCategory = 
  | 'performance' 
  | 'security' 
  | 'scaling' 
  | 'cost_optimization' 
  | 'user_experience' 
  | 'system_health'
  | 'integration'
  | 'compliance';

export type BusinessActionType = 
  | 'scale_up' 
  | 'scale_down' 
  | 'send_alert' 
  | 'run_command' 
  | 'update_config' 
  | 'create_backup' 
  | 'restart_service'
  | 'execute_workflow'
  | 'notify_team';

export interface DecisionContext {
  timestamp: Date;
  systemMetrics: SystemMetrics;
  businessMetrics: BusinessMetrics;
  externalFactors: ExternalFactors;
  userBehavior: UserBehaviorMetrics;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}

export interface BusinessMetrics {
  activeUsers: number;
  revenue: number;
  conversionRate: number;
  churnRate: number;
  customerSatisfaction: number;
  supportTickets: number;
}

export interface ExternalFactors {
  timeOfDay: number;
  dayOfWeek: number;
  seasonality: 'low' | 'medium' | 'high';
  marketConditions: 'stable' | 'volatile' | 'bullish' | 'bearish';
  competitorActivity: 'low' | 'medium' | 'high';
}

export interface UserBehaviorMetrics {
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
  conversionFunnel: { [stage: string]: number };
  deviceDistribution: { [device: string]: number };
}

export interface DecisionLog {
  id: string;
  timestamp: Date;
  context: DecisionContext;
  triggeredRules: string[];
  decisions: BusinessDecision[];
  outcome: 'success' | 'failure' | 'partial';
  impact: DecisionImpact;
}

export interface BusinessDecision {
  ruleId: string;
  action: BusinessAction;
  confidence: number;
  reasoning: string;
  executed: boolean;
  result?: any;
}

export interface DecisionImpact {
  performanceChange?: number;
  costChange?: number;
  userExperienceChange?: number;
  securityChange?: number;
}

export class BusinessLogicAgent implements TorreAgent {
  readonly id = 'business-logic-agent';
  readonly name = 'Business Logic Agent';
  readonly description = 'Sistema autônomo de decisões inteligentes de negócio';
  readonly version = '1.0.0';

  private rules: Map<string, BusinessRule> = new Map();
  private decisionHistory: DecisionLog[] = [];
  private contextBuffer: DecisionContext[] = [];
  private rulesPath: string;
  private learningEnabled: boolean = true;

  constructor(config?: {
    rulesPath?: string;
    learningEnabled?: boolean;
  }) {
    this.rulesPath = config?.rulesPath || path.join(process.cwd(), '.business-rules');
    this.learningEnabled = config?.learningEnabled !== false;

    this.initializeRulesEngine();
    this.loadBusinessRules();
    this.setupDefaultRules();
    this.startDecisionEngine();

    console.log('🧠 Business Logic Agent initialized successfully');
  }

  private initializeRulesEngine(): void {
    try {
      if (!fs.existsSync(this.rulesPath)) {
        fs.mkdirSync(this.rulesPath, { recursive: true });
      }
    } catch (error) {
      console.error('❌ Failed to initialize rules engine:', error);
    }
  }

  private loadBusinessRules(): void {
    try {
      const rulesFile = path.join(this.rulesPath, 'rules.json');
      if (fs.existsSync(rulesFile)) {
        const rulesData = JSON.parse(fs.readFileSync(rulesFile, 'utf8'));
        
        rulesData.forEach((rule: any) => {
          this.rules.set(rule.id, {
            ...rule,
            createdAt: new Date(rule.createdAt),
            updatedAt: new Date(rule.updatedAt),
            lastExecuted: rule.lastExecuted ? new Date(rule.lastExecuted) : undefined
          });
        });
        
        console.log(`🧠 Loaded ${this.rules.size} business rules`);
      }
    } catch (error) {
      console.error('❌ Failed to load business rules:', error);
    }
  }

  private saveBusinessRules(): void {
    try {
      const rulesFile = path.join(this.rulesPath, 'rules.json');
      const rulesArray = Array.from(this.rules.values());
      fs.writeFileSync(rulesFile, JSON.stringify(rulesArray, null, 2));
    } catch (error) {
      console.error('❌ Failed to save business rules:', error);
    }
  }

  private setupDefaultRules(): void {
    if (this.rules.size === 0) {
      console.log('🔧 Setting up default business rules...');

      const defaultRules: Omit<BusinessRule, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>[] = [
        {
          name: 'High CPU Auto-Scale',
          description: 'Automatically scale up when CPU usage exceeds 80%',
          category: 'performance',
          conditions: [
            { field: 'systemMetrics.cpu', operator: 'greater_than', value: 80 }
          ],
          actions: [
            { type: 'scale_up', target: 'system', parameters: { instances: 1, reason: 'high_cpu' } }
          ],
          priority: 1,
          enabled: true
        },
        {
          name: 'Memory Pressure Response',
          description: 'Clean up and optimize when memory usage exceeds 90%',
          category: 'performance',
          conditions: [
            { field: 'systemMetrics.memory', operator: 'greater_than', value: 90 }
          ],
          actions: [
            { type: 'run_command', target: 'memory_optimizer', parameters: { action: 'cleanup' } },
            { type: 'send_alert', target: 'ops_team', parameters: { severity: 'high', message: 'High memory usage detected' } }
          ],
          priority: 1,
          enabled: true
        },
        {
          name: 'High Error Rate Alert',
          description: 'Alert when error rate exceeds 5%',
          category: 'system_health',
          conditions: [
            { field: 'systemMetrics.errorRate', operator: 'greater_than', value: 5 }
          ],
          actions: [
            { type: 'send_alert', target: 'dev_team', parameters: { severity: 'critical', message: 'High error rate detected' } },
            { type: 'create_backup', target: 'system_state', parameters: { reason: 'high_errors' } }
          ],
          priority: 1,
          enabled: true
        },
        {
          name: 'Low Usage Scale Down',
          description: 'Scale down during low usage periods to save costs',
          category: 'cost_optimization',
          conditions: [
            { field: 'systemMetrics.cpu', operator: 'less_than', value: 20 },
            { field: 'businessMetrics.activeUsers', operator: 'less_than', value: 10, logicalOperator: 'AND' }
          ],
          actions: [
            { type: 'scale_down', target: 'system', parameters: { instances: 1, reason: 'low_usage' } }
          ],
          priority: 3,
          enabled: true
        },
        {
          name: 'Security Threat Response',
          description: 'Respond to security threats automatically',
          category: 'security',
          conditions: [
            { field: 'systemMetrics.securityScore', operator: 'less_than', value: 70 }
          ],
          actions: [
            { type: 'send_alert', target: 'security_team', parameters: { severity: 'critical', message: 'Security threat detected' } },
            { type: 'update_config', target: 'security_settings', parameters: { lockdown_mode: true } }
          ],
          priority: 1,
          enabled: true
        },
        {
          name: 'Peak Hours Preparation',
          description: 'Prepare for peak hours by pre-scaling',
          category: 'user_experience',
          conditions: [
            { field: 'externalFactors.timeOfDay', operator: 'in', value: [8, 9, 17, 18, 19, 20] }
          ],
          actions: [
            { type: 'scale_up', target: 'system', parameters: { instances: 2, reason: 'peak_hours_prep' } }
          ],
          priority: 2,
          enabled: true
        }
      ];

      defaultRules.forEach(rule => {
        this.createRule(rule);
      });

      console.log('✅ Default business rules created');
    }
  }

  private startDecisionEngine(): void {
    // Executar decisões a cada 30 segundos
    setInterval(() => {
      this.executeDecisionCycle();
    }, 30000);

    // Análise de tendências a cada 5 minutos
    setInterval(() => {
      this.analyzeTrends();
    }, 300000);

    // Otimização de regras a cada hora
    setInterval(() => {
      this.optimizeRules();
    }, 3600000);
  }

  private async executeDecisionCycle(): Promise<void> {
    try {
      const context = await this.gatherDecisionContext();
      const decisions = this.evaluateBusinessRules(context);
      
      if (decisions.length > 0) {
        const decisionLog = await this.executeDecisions(context, decisions);
        this.recordDecisionOutcome(decisionLog);
      }

      this.contextBuffer.push(context);
      if (this.contextBuffer.length > 100) {
        this.contextBuffer = this.contextBuffer.slice(-100);
      }

    } catch (error) {
      console.error('❌ Decision cycle error:', error);
    }
  }

  private async gatherDecisionContext(): Promise<DecisionContext> {
    // Simular coleta de métricas do sistema
    const systemMetrics: SystemMetrics = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      network: Math.random() * 100,
      responseTime: Math.random() * 1000 + 100,
      errorRate: Math.random() * 10,
      throughput: Math.random() * 1000 + 100
    };

    const businessMetrics: BusinessMetrics = {
      activeUsers: Math.floor(Math.random() * 1000),
      revenue: Math.random() * 10000,
      conversionRate: Math.random() * 10,
      churnRate: Math.random() * 5,
      customerSatisfaction: Math.random() * 100,
      supportTickets: Math.floor(Math.random() * 50)
    };

    const now = new Date();
    const externalFactors: ExternalFactors = {
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      seasonality: this.getSeasonality(),
      marketConditions: 'stable',
      competitorActivity: 'low'
    };

    const userBehavior: UserBehaviorMetrics = {
      sessionDuration: Math.random() * 600 + 60,
      pageViews: Math.random() * 20 + 1,
      bounceRate: Math.random() * 80,
      conversionFunnel: {
        landing: 100,
        signup: 30,
        trial: 15,
        paid: 5
      },
      deviceDistribution: {
        desktop: 60,
        mobile: 35,
        tablet: 5
      }
    };

    return {
      timestamp: now,
      systemMetrics,
      businessMetrics,
      externalFactors,
      userBehavior
    };
  }

  private getSeasonality(): 'low' | 'medium' | 'high' {
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) return 'high';
    if (hour >= 6 && hour <= 22) return 'medium';
    return 'low';
  }

  private evaluateBusinessRules(context: DecisionContext): BusinessDecision[] {
    const decisions: BusinessDecision[] = [];
    const enabledRules = Array.from(this.rules.values())
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of enabledRules) {
      const shouldExecute = this.evaluateConditions(rule.conditions, context);
      
      if (shouldExecute) {
        const confidence = this.calculateConfidence(rule, context);
        
        for (const action of rule.actions) {
          decisions.push({
            ruleId: rule.id,
            action,
            confidence,
            reasoning: this.generateReasoning(rule, context),
            executed: false
          });
        }
      }
    }

    return decisions;
  }

  private evaluateConditions(conditions: BusinessCondition[], context: DecisionContext): boolean {
    if (conditions.length === 0) return false;

    let result = this.evaluateCondition(conditions[0], context);

    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(condition, context);
      
      if (condition.logicalOperator === 'OR') {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }
    }

    return result;
  }

  private evaluateCondition(condition: BusinessCondition, context: DecisionContext): boolean {
    const value = this.getNestedValue(context, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'greater_than':
        return value > condition.value;
      case 'less_than':
        return value < condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'not_contains':
        return !String(value).includes(String(condition.value));
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private calculateConfidence(rule: BusinessRule, context: DecisionContext): number {
    let confidence = 70; // Base confidence

    // Aumentar confiança baseado no histórico de sucesso
    const recentExecutions = this.decisionHistory
      .filter(log => log.decisions.some(d => d.ruleId === rule.id))
      .slice(-10);

    if (recentExecutions.length > 0) {
      const successRate = recentExecutions.filter(log => log.outcome === 'success').length / recentExecutions.length;
      confidence += (successRate - 0.5) * 40;
    }

    // Ajustar baseado na categoria da regra
    switch (rule.category) {
      case 'security':
        confidence += 20; // Mais confiança em regras de segurança
        break;
      case 'performance':
        confidence += 15;
        break;
      case 'cost_optimization':
        confidence += 5;
        break;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  private generateReasoning(rule: BusinessRule, context: DecisionContext): string {
    const reasons = [];
    
    for (const condition of rule.conditions) {
      const value = this.getNestedValue(context, condition.field);
      reasons.push(`${condition.field} (${value}) ${condition.operator} ${condition.value}`);
    }

    return `Rule "${rule.name}" triggered because: ${reasons.join(' AND ')}`;
  }

  private async executeDecisions(context: DecisionContext, decisions: BusinessDecision[]): Promise<DecisionLog> {
    const decisionLog: DecisionLog = {
      id: this.generateId(),
      timestamp: new Date(),
      context,
      triggeredRules: [...new Set(decisions.map(d => d.ruleId))],
      decisions: [],
      outcome: 'success',
      impact: {}
    };

    for (const decision of decisions) {
      try {
        const result = await this.executeAction(decision.action);
        decision.executed = true;
        decision.result = result;
        
        // Update rule execution count
        const rule = this.rules.get(decision.ruleId);
        if (rule) {
          rule.executionCount++;
          rule.lastExecuted = new Date();
          rule.updatedAt = new Date();
        }

        console.log(`✅ Executed business decision: ${decision.action.type} (confidence: ${decision.confidence.toFixed(1)}%)`);
        
      } catch (error) {
        decision.executed = false;
        decision.result = { error: (error as Error).message };
        decisionLog.outcome = 'partial';
        
        console.error(`❌ Failed to execute business decision:`, error);
      }
      
      decisionLog.decisions.push(decision);
    }

    // Calculate impact
    decisionLog.impact = this.calculateImpact(decisionLog);

    return decisionLog;
  }

  private async executeAction(action: BusinessAction): Promise<any> {
    console.log(`🎯 Executing business action: ${action.type} on ${action.target}`);
    
    switch (action.type) {
      case 'scale_up':
        return this.executeScaleUp(action);
      
      case 'scale_down':
        return this.executeScaleDown(action);
      
      case 'send_alert':
        return this.executeSendAlert(action);
      
      case 'run_command':
        return this.executeRunCommand(action);
      
      case 'update_config':
        return this.executeUpdateConfig(action);
      
      case 'create_backup':
        return this.executeCreateBackup(action);
      
      case 'restart_service':
        return this.executeRestartService(action);
      
      case 'execute_workflow':
        return this.executeWorkflow(action);
      
      case 'notify_team':
        return this.executeNotifyTeam(action);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async executeScaleUp(action: BusinessAction): Promise<any> {
    console.log(`📈 Scaling up ${action.target}:`, action.parameters);
    // Simular scaling up
    return { success: true, newInstances: action.parameters.instances || 1 };
  }

  private async executeScaleDown(action: BusinessAction): Promise<any> {
    console.log(`📉 Scaling down ${action.target}:`, action.parameters);
    // Simular scaling down
    return { success: true, removedInstances: action.parameters.instances || 1 };
  }

  private async executeSendAlert(action: BusinessAction): Promise<any> {
    console.log(`🚨 Sending alert to ${action.target}:`, action.parameters);
    // Simular envio de alerta
    return { success: true, alertId: this.generateId() };
  }

  private async executeRunCommand(action: BusinessAction): Promise<any> {
    console.log(`⚡ Running command on ${action.target}:`, action.parameters);
    // Simular execução de comando
    return { success: true, output: 'Command executed successfully' };
  }

  private async executeUpdateConfig(action: BusinessAction): Promise<any> {
    console.log(`⚙️ Updating config for ${action.target}:`, action.parameters);
    // Simular atualização de configuração
    return { success: true, updatedFields: Object.keys(action.parameters) };
  }

  private async executeCreateBackup(action: BusinessAction): Promise<any> {
    console.log(`💾 Creating backup of ${action.target}:`, action.parameters);
    // Simular criação de backup
    return { success: true, backupId: this.generateId() };
  }

  private async executeRestartService(action: BusinessAction): Promise<any> {
    console.log(`🔄 Restarting service ${action.target}:`, action.parameters);
    // Simular restart de serviço
    return { success: true, restartTime: new Date() };
  }

  private async executeWorkflow(action: BusinessAction): Promise<any> {
    console.log(`🔀 Executing workflow ${action.target}:`, action.parameters);
    // Simular execução de workflow
    return { success: true, workflowId: action.target };
  }

  private async executeNotifyTeam(action: BusinessAction): Promise<any> {
    console.log(`📢 Notifying team ${action.target}:`, action.parameters);
    // Simular notificação de equipe
    return { success: true, notificationId: this.generateId() };
  }

  private calculateImpact(decisionLog: DecisionLog): DecisionImpact {
    const impact: DecisionImpact = {};
    
    // Simular cálculo de impacto baseado nas ações executadas
    const successfulActions = decisionLog.decisions.filter(d => d.executed && d.result?.success);
    
    if (successfulActions.length > 0) {
      impact.performanceChange = Math.random() * 20 - 10; // -10 to +10%
      impact.costChange = Math.random() * 30 - 15; // -15 to +15%
      impact.userExperienceChange = Math.random() * 15; // 0 to +15%
      impact.securityChange = Math.random() * 10; // 0 to +10%
    }
    
    return impact;
  }

  private recordDecisionOutcome(decisionLog: DecisionLog): void {
    this.decisionHistory.push(decisionLog);
    
    // Manter apenas últimas 1000 decisões
    if (this.decisionHistory.length > 1000) {
      this.decisionHistory = this.decisionHistory.slice(-1000);
    }

    this.saveBusinessRules();
  }

  private analyzeTrends(): void {
    if (this.contextBuffer.length < 10) return;

    console.log('📊 Analyzing business trends...');
    
    // Analisar tendências de CPU
    const cpuTrend = this.calculateTrend(this.contextBuffer.map(c => c.systemMetrics.cpu));
    if (cpuTrend.slope > 1) {
      console.log('⬆️ CPU usage trending upward, consider proactive scaling');
    }

    // Analisar tendências de usuários ativos
    const userTrend = this.calculateTrend(this.contextBuffer.map(c => c.businessMetrics.activeUsers));
    if (userTrend.slope > 2) {
      console.log('📈 User growth trending upward, prepare for increased load');
    }

    // Analisar taxa de erro
    const errorTrend = this.calculateTrend(this.contextBuffer.map(c => c.systemMetrics.errorRate));
    if (errorTrend.slope > 0.1) {
      console.log('⚠️ Error rate trending upward, investigate potential issues');
    }
  }

  private calculateTrend(values: number[]): { slope: number; correlation: number } {
    if (values.length < 2) return { slope: 0, correlation: 0 };
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    const sumY2 = values.reduce((sum, val) => sum + (val * val), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return { slope: slope || 0, correlation: correlation || 0 };
  }

  private optimizeRules(): void {
    if (!this.learningEnabled) return;

    console.log('🎯 Optimizing business rules...');
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Analisar performance das regras na última semana
    const recentDecisions = this.decisionHistory.filter(log => log.timestamp > oneWeekAgo);
    
    for (const rule of this.rules.values()) {
      const ruleDecisions = recentDecisions.filter(log => 
        log.decisions.some(d => d.ruleId === rule.id)
      );
      
      if (ruleDecisions.length > 0) {
        const successRate = ruleDecisions.filter(log => log.outcome === 'success').length / ruleDecisions.length;
        
        // Desabilitar regras com baixa taxa de sucesso
        if (successRate < 0.3 && rule.executionCount > 10) {
          console.log(`⚠️ Disabling underperforming rule: ${rule.name} (success rate: ${(successRate * 100).toFixed(1)}%)`);
          rule.enabled = false;
          rule.updatedAt = now;
        }
        
        // Aumentar prioridade de regras com alta taxa de sucesso
        if (successRate > 0.9 && rule.priority > 1) {
          rule.priority = Math.max(1, rule.priority - 1);
          rule.updatedAt = now;
          console.log(`⬆️ Increasing priority of successful rule: ${rule.name}`);
        }
      }
    }
    
    this.saveBusinessRules();
  }

  private generateId(): string {
    return `bl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API Methods
  async createRule(ruleData: Omit<BusinessRule, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>): Promise<string> {
    const rule: BusinessRule = {
      ...ruleData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0
    };
    
    this.rules.set(rule.id, rule);
    this.saveBusinessRules();
    
    console.log(`🆕 Business rule created: ${rule.name}`);
    return rule.id;
  }

  async updateRule(ruleId: string, updates: Partial<BusinessRule>): Promise<boolean> {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;
    
    Object.assign(rule, updates, { updatedAt: new Date() });
    this.saveBusinessRules();
    
    console.log(`📝 Business rule updated: ${rule.name}`);
    return true;
  }

  async deleteRule(ruleId: string): Promise<boolean> {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;
    
    this.rules.delete(ruleId);
    this.saveBusinessRules();
    
    console.log(`🗑️ Business rule deleted: ${rule.name}`);
    return true;
  }

  listRules(filter?: {
    category?: BusinessRuleCategory;
    enabled?: boolean;
  }): BusinessRule[] {
    return Array.from(this.rules.values()).filter(rule => {
      if (filter?.category && rule.category !== filter.category) return false;
      if (filter?.enabled !== undefined && rule.enabled !== filter.enabled) return false;
      return true;
    });
  }

  getDecisionHistory(filter?: {
    since?: Date;
    outcome?: DecisionLog['outcome'];
    ruleId?: string;
  }): DecisionLog[] {
    return this.decisionHistory.filter(log => {
      if (filter?.since && log.timestamp < filter.since) return false;
      if (filter?.outcome && log.outcome !== filter.outcome) return false;
      if (filter?.ruleId && !log.triggeredRules.includes(filter.ruleId)) return false;
      return true;
    });
  }

  getBusinessMetrics() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentDecisions = this.decisionHistory.filter(log => log.timestamp > last24h);
    const weeklyDecisions = this.decisionHistory.filter(log => log.timestamp > lastWeek);
    
    return {
      totalRules: this.rules.size,
      activeRules: Array.from(this.rules.values()).filter(r => r.enabled).length,
      decisionsLast24h: recentDecisions.length,
      decisionsLastWeek: weeklyDecisions.length,
      successRate: recentDecisions.length > 0 ? 
        recentDecisions.filter(d => d.outcome === 'success').length / recentDecisions.length : 0,
      averageConfidence: recentDecisions.length > 0 ?
        recentDecisions.reduce((sum, log) => 
          sum + log.decisions.reduce((dSum, d) => dSum + d.confidence, 0) / log.decisions.length, 0) / recentDecisions.length : 0,
      topPerformingRules: this.getTopPerformingRules(5),
      categoryDistribution: this.getCategoryDistribution()
    };
  }

  private getTopPerformingRules(limit: number): Array<{ ruleId: string; name: string; executionCount: number; successRate: number }> {
    const rulesWithMetrics = Array.from(this.rules.values())
      .filter(rule => rule.executionCount > 0)
      .map(rule => {
        const ruleDecisions = this.decisionHistory.filter(log => 
          log.decisions.some(d => d.ruleId === rule.id)
        );
        const successRate = ruleDecisions.length > 0 ?
          ruleDecisions.filter(log => log.outcome === 'success').length / ruleDecisions.length : 0;
        
        return {
          ruleId: rule.id,
          name: rule.name,
          executionCount: rule.executionCount,
          successRate
        };
      })
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, limit);
    
    return rulesWithMetrics;
  }

  private getCategoryDistribution(): { [category: string]: number } {
    const distribution: { [category: string]: number } = {};
    
    for (const rule of this.rules.values()) {
      distribution[rule.category] = (distribution[rule.category] || 0) + 1;
    }
    
    return distribution;
  }

  // TorreAgent implementation
  async processTask(task: any): Promise<any> {
    try {
      switch (task.action) {
        case 'create_rule':
          return await this.createRule(task.data);
        
        case 'update_rule':
          return await this.updateRule(task.data.id, task.data.updates);
        
        case 'delete_rule':
          return await this.deleteRule(task.data.id);
        
        case 'list_rules':
          return this.listRules(task.data.filter);
        
        case 'get_decision_history':
          return this.getDecisionHistory(task.data.filter);
        
        case 'get_metrics':
          return this.getBusinessMetrics();
        
        case 'force_decision_cycle':
          await this.executeDecisionCycle();
          return { success: true };
        
        case 'optimize_rules':
          this.optimizeRules();
          return { success: true };
        
        default:
          throw new Error(`Unknown task action: ${task.action}`);
      }
    } catch (error: any) {
      console.error(`❌ Business Logic Agent task failed:`, error);
      throw error;
    }
  }

  getStatus() {
    const metrics = this.getBusinessMetrics();
    
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      status: 'active',
      metrics,
      capabilities: [
        'Automated decision making',
        'Business rule management',
        'Trend analysis',
        'Performance optimization',
        'Impact assessment'
      ]
    };
  }
}

// Export singleton instance
export const businessLogicAgent = new BusinessLogicAgent();