/**
 * 📊 TORRE SUPREMA OBSERVABILITY ENGINE
 * Sistema avançado de observabilidade, métricas e distributed tracing
 */

export interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  value: number;
  timestamp: Date;
  labels: { [key: string]: string };
  unit?: string;
}

export interface Trace {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  tags: { [key: string]: any };
  logs: TraceLog[];
  status: 'active' | 'completed' | 'error';
}

export interface TraceLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  fields?: { [key: string]: any };
}

export interface Alert {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'suppressed';
  triggeredAt: Date;
  resolvedAt?: Date;
  message: string;
  metadata?: any;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  panels: DashboardPanel[];
  refreshInterval: number;
  timeRange: TimeRange;
}

export interface DashboardPanel {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'stat' | 'table' | 'heatmap';
  query: string;
  position: { x: number; y: number; width: number; height: number };
  thresholds?: Threshold[];
}

export interface Threshold {
  value: number;
  color: string;
  condition: 'gt' | 'lt' | 'eq';
}

export interface TimeRange {
  from: Date;
  to: Date;
}

export interface PerformanceProfile {
  component: string;
  function: string;
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  callCount: number;
  timestamp: Date;
}

export class TorreSupremaObservabilityEngine {
  private metrics: Map<string, Metric[]> = new Map();
  private traces: Map<string, Trace> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();
  private performanceProfiles: PerformanceProfile[] = [];
  private alertRules: AlertRule[] = [];
  private collectors: MetricCollector[] = [];

  constructor() {
    console.log('📊 Torre Suprema Observability Engine INITIALIZED');
    this.initializeDefaultMetrics();
    this.initializeDefaultDashboards();
    this.initializeAlertRules();
    this.startMetricCollection();
  }

  private initializeDefaultMetrics() {
    // Métricas padrão do sistema
    const defaultMetrics = [
      'torre_suprema_tasks_total',
      'torre_suprema_agents_active',
      'torre_suprema_response_time',
      'torre_suprema_error_rate',
      'torre_suprema_memory_usage',
      'torre_suprema_cpu_usage'
    ];

    defaultMetrics.forEach(metricName => {
      this.metrics.set(metricName, []);
    });

    console.log(`✅ ${defaultMetrics.length} default metrics initialized`);
  }

  // 📈 Metrics Collection
  recordMetric(name: string, type: Metric['type'], value: number, labels: { [key: string]: string } = {}): void {
    const metric: Metric = {
      name,
      type,
      value,
      timestamp: new Date(),
      labels,
      unit: this.getMetricUnit(name)
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricHistory = this.metrics.get(name)!;
    metricHistory.push(metric);

    // Manter apenas últimas 1000 métricas por tipo
    if (metricHistory.length > 1000) {
      metricHistory.splice(0, metricHistory.length - 500);
    }

    // Verificar alertas
    this.checkAlerts(metric);
  }

  private getMetricUnit(metricName: string): string {
    const unitMap: { [key: string]: string } = {
      'response_time': 'ms',
      'memory_usage': 'bytes',
      'cpu_usage': '%',
      'error_rate': '%',
      'requests': 'count',
      'tasks': 'count'
    };

    for (const [key, unit] of Object.entries(unitMap)) {
      if (metricName.includes(key)) {
        return unit;
      }
    }

    return 'count';
  }

  // 🔍 Distributed Tracing
  startTrace(operationName: string, parentSpanId?: string): string {
    const traceId = parentSpanId ? 
      this.getTraceIdFromSpan(parentSpanId) : 
      `trace-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    
    const spanId = `span-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const trace: Trace = {
      traceId,
      spanId,
      parentSpanId,
      operationName,
      startTime: new Date(),
      tags: {},
      logs: [],
      status: 'active'
    };

    this.traces.set(spanId, trace);
    
    console.log(`🔍 Trace started: ${operationName} [${spanId}]`);
    return spanId;
  }

  finishTrace(spanId: string, error?: Error): void {
    const trace = this.traces.get(spanId);
    if (!trace) return;

    trace.endTime = new Date();
    trace.duration = trace.endTime.getTime() - trace.startTime.getTime();
    trace.status = error ? 'error' : 'completed';

    if (error) {
      trace.tags.error = true;
      trace.logs.push({
        timestamp: new Date(),
        level: 'error',
        message: error.message,
        fields: { stack: error.stack }
      });
    }

    // Registrar métrica de duração
    this.recordMetric(`${trace.operationName}_duration`, 'timer', trace.duration, {
      operation: trace.operationName,
      status: trace.status
    });

    console.log(`✅ Trace finished: ${trace.operationName} - ${trace.duration}ms [${spanId}]`);
  }

  addTraceLog(spanId: string, level: TraceLog['level'], message: string, fields?: any): void {
    const trace = this.traces.get(spanId);
    if (!trace) return;

    trace.logs.push({
      timestamp: new Date(),
      level,
      message,
      fields
    });
  }

  addTraceTags(spanId: string, tags: { [key: string]: any }): void {
    const trace = this.traces.get(spanId);
    if (!trace) return;

    Object.assign(trace.tags, tags);
  }

  private getTraceIdFromSpan(spanId: string): string {
    const trace = this.traces.get(spanId);
    return trace ? trace.traceId : spanId;
  }

  // 🚨 Alerting System
  private initializeAlertRules() {
    const defaultAlerts: AlertRule[] = [
      {
        name: 'High Response Time',
        condition: 'torre_suprema_response_time > 5000',
        severity: 'high',
        description: 'Response time exceeds 5 seconds'
      },
      {
        name: 'High Error Rate',
        condition: 'torre_suprema_error_rate > 10',
        severity: 'critical',
        description: 'Error rate above 10%'
      },
      {
        name: 'Agent Failure',
        condition: 'torre_suprema_agents_active < 1',
        severity: 'critical',
        description: 'No active agents available'
      },
      {
        name: 'High Memory Usage',
        condition: 'torre_suprema_memory_usage > 85',
        severity: 'medium',
        description: 'Memory usage above 85%'
      }
    ];

    this.alertRules = defaultAlerts;
    console.log(`🚨 ${defaultAlerts.length} alert rules configured`);
  }

  private checkAlerts(metric: Metric): void {
    for (const rule of this.alertRules) {
      const shouldAlert = this.evaluateAlertCondition(rule.condition, metric);
      
      if (shouldAlert) {
        this.triggerAlert(rule, metric);
      }
    }
  }

  private evaluateAlertCondition(condition: string, metric: Metric): boolean {
    // Avaliação simplificada da condição
    const conditionParts = condition.split(' ');
    const metricName = conditionParts[0];
    const operator = conditionParts[1];
    const threshold = parseFloat(conditionParts[2]);

    if (metric.name !== metricName) return false;

    switch (operator) {
      case '>': return metric.value > threshold;
      case '<': return metric.value < threshold;
      case '>=': return metric.value >= threshold;
      case '<=': return metric.value <= threshold;
      case '==': return metric.value === threshold;
      default: return false;
    }
  }

  private triggerAlert(rule: AlertRule, metric: Metric): void {
    const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    const alert: Alert = {
      id: alertId,
      name: rule.name,
      condition: rule.condition,
      severity: rule.severity,
      status: 'active',
      triggeredAt: new Date(),
      message: `${rule.description} - Current value: ${metric.value}`,
      metadata: { metric, rule }
    };

    this.alerts.set(alertId, alert);
    
    console.log(`🚨 ALERT TRIGGERED: ${alert.name} - ${alert.severity.toUpperCase()}`);
    console.log(`📊 Condition: ${alert.condition}`);
    console.log(`💡 Message: ${alert.message}`);
  }

  // 📊 Dashboard Management
  private initializeDefaultDashboards() {
    const systemOverview: Dashboard = {
      id: 'system-overview',
      name: 'Torre Suprema - System Overview',
      description: 'Overall system health and performance metrics',
      refreshInterval: 30000,
      timeRange: {
        from: new Date(Date.now() - 3600000), // 1 hour ago
        to: new Date()
      },
      panels: [
        {
          id: 'active-agents',
          title: 'Active Agents',
          type: 'stat',
          query: 'torre_suprema_agents_active',
          position: { x: 0, y: 0, width: 6, height: 3 },
          thresholds: [
            { value: 0, color: 'red', condition: 'eq' },
            { value: 1, color: 'green', condition: 'gt' }
          ]
        },
        {
          id: 'response-time',
          title: 'Response Time',
          type: 'line',
          query: 'torre_suprema_response_time',
          position: { x: 6, y: 0, width: 6, height: 3 }
        },
        {
          id: 'task-throughput',
          title: 'Task Throughput',
          type: 'bar',
          query: 'torre_suprema_tasks_total',
          position: { x: 0, y: 3, width: 12, height: 4 }
        }
      ]
    };

    this.dashboards.set(systemOverview.id, systemOverview);
    console.log('📊 Default dashboards initialized');
  }

  // 🔧 Performance Profiling
  profileFunction<T>(component: string, functionName: string, fn: () => T): T {
    const startTime = Date.now();
    const startMemory = this.getCurrentMemoryUsage();
    const startCPU = this.getCurrentCPUUsage();

    try {
      const result = fn();
      
      const endTime = Date.now();
      const endMemory = this.getCurrentMemoryUsage();
      const endCPU = this.getCurrentCPUUsage();

      const profile: PerformanceProfile = {
        component,
        function: functionName,
        executionTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        cpuUsage: endCPU - startCPU,
        callCount: 1,
        timestamp: new Date()
      };

      this.performanceProfiles.push(profile);
      
      // Manter apenas últimos 1000 profiles
      if (this.performanceProfiles.length > 1000) {
        this.performanceProfiles.splice(0, 500);
      }

      return result;
    } catch (error) {
      this.recordMetric('function_error', 'counter', 1, {
        component,
        function: functionName
      });
      throw error;
    }
  }

  private getCurrentMemoryUsage(): number {
    return process.memoryUsage().heapUsed;
  }

  private getCurrentCPUUsage(): number {
    // Simulação de uso de CPU
    return Math.random() * 100;
  }

  // 📈 Metric Collection Automation
  private startMetricCollection(): void {
    console.log('📈 Starting automated metric collection...');

    // Coletar métricas do sistema a cada 30 segundos
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Coletar métricas de aplicação a cada 10 segundos
    setInterval(() => {
      this.collectApplicationMetrics();
    }, 10000);
  }

  private collectSystemMetrics(): void {
    const memUsage = process.memoryUsage();
    const cpuUsage = this.getCurrentCPUUsage();

    this.recordMetric('torre_suprema_memory_usage', 'gauge', memUsage.heapUsed / memUsage.heapTotal * 100);
    this.recordMetric('torre_suprema_cpu_usage', 'gauge', cpuUsage);
    this.recordMetric('torre_suprema_memory_heap_size', 'gauge', memUsage.heapTotal);
  }

  private collectApplicationMetrics(): void {
    // Simular métricas de aplicação
    this.recordMetric('torre_suprema_agents_active', 'gauge', Math.floor(Math.random() * 5) + 1);
    this.recordMetric('torre_suprema_tasks_total', 'counter', Math.floor(Math.random() * 10));
    this.recordMetric('torre_suprema_response_time', 'histogram', Math.random() * 1000 + 100);
    this.recordMetric('torre_suprema_error_rate', 'gauge', Math.random() * 5);
  }

  // 📊 Analytics & Reporting
  getObservabilityMetrics() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    const recentMetrics = this.getMetricsInTimeRange(oneHourAgo, now);
    const activeTraces = Array.from(this.traces.values()).filter(t => t.status === 'active');
    const activeAlerts = Array.from(this.alerts.values()).filter(a => a.status === 'active');

    return {
      metrics: {
        total: Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0),
        recent: recentMetrics.length,
        types: Array.from(this.metrics.keys()).length
      },
      tracing: {
        totalTraces: this.traces.size,
        activeTraces: activeTraces.length,
        averageTraceTime: this.calculateAverageTraceTime(),
        errorRate: this.calculateTraceErrorRate()
      },
      alerts: {
        active: activeAlerts.length,
        total: this.alerts.size,
        bySeverity: this.getAlertsBySeverity(activeAlerts),
        resolvedToday: this.getResolvedAlertsToday()
      },
      performance: {
        profiledFunctions: this.performanceProfiles.length,
        averageExecutionTime: this.calculateAverageExecutionTime(),
        memoryTrends: this.getMemoryTrends(),
        cpuTrends: this.getCPUTrends()
      },
      systemHealth: this.calculateSystemHealthScore(),
      timestamp: now
    };
  }

  private getMetricsInTimeRange(from: Date, to: Date): Metric[] {
    const metrics: Metric[] = [];
    
    for (const metricHistory of this.metrics.values()) {
      metrics.push(...metricHistory.filter(m => 
        m.timestamp >= from && m.timestamp <= to
      ));
    }
    
    return metrics;
  }

  private calculateAverageTraceTime(): number {
    const completedTraces = Array.from(this.traces.values())
      .filter(t => t.status === 'completed' && t.duration);
    
    if (completedTraces.length === 0) return 0;
    
    return completedTraces.reduce((sum, trace) => sum + trace.duration!, 0) / completedTraces.length;
  }

  private calculateTraceErrorRate(): number {
    const totalTraces = this.traces.size;
    if (totalTraces === 0) return 0;
    
    const errorTraces = Array.from(this.traces.values()).filter(t => t.status === 'error').length;
    return (errorTraces / totalTraces) * 100;
  }

  private getAlertsBySeverity(alerts: Alert[]) {
    const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
    alerts.forEach(alert => {
      bySeverity[alert.severity]++;
    });
    return bySeverity;
  }

  private getResolvedAlertsToday(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.alerts.values()).filter(alert => 
      alert.status === 'resolved' && 
      alert.resolvedAt && 
      alert.resolvedAt >= today
    ).length;
  }

  private calculateAverageExecutionTime(): number {
    if (this.performanceProfiles.length === 0) return 0;
    
    return this.performanceProfiles.reduce((sum, profile) => sum + profile.executionTime, 0) / this.performanceProfiles.length;
  }

  private getMemoryTrends(): any {
    const memoryMetrics = this.metrics.get('torre_suprema_memory_usage') || [];
    const recent = memoryMetrics.slice(-10);
    
    return {
      current: recent[recent.length - 1]?.value || 0,
      average: recent.reduce((sum, m) => sum + m.value, 0) / recent.length || 0,
      trend: this.calculateTrend(recent.map(m => m.value))
    };
  }

  private getCPUTrends(): any {
    const cpuMetrics = this.metrics.get('torre_suprema_cpu_usage') || [];
    const recent = cpuMetrics.slice(-10);
    
    return {
      current: recent[recent.length - 1]?.value || 0,
      average: recent.reduce((sum, m) => sum + m.value, 0) / recent.length || 0,
      trend: this.calculateTrend(recent.map(m => m.value))
    };
  }

  private calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const first = values.slice(0, Math.floor(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = first.reduce((sum, v) => sum + v, 0) / first.length;
    const secondAvg = second.reduce((sum, v) => sum + v, 0) / second.length;
    
    const diff = Math.abs(secondAvg - firstAvg);
    if (diff < 5) return 'stable';
    
    return secondAvg > firstAvg ? 'up' : 'down';
  }

  private calculateSystemHealthScore(): number {
    let score = 100;
    
    const activeAlerts = Array.from(this.alerts.values()).filter(a => a.status === 'active');
    score -= activeAlerts.filter(a => a.severity === 'critical').length * 20;
    score -= activeAlerts.filter(a => a.severity === 'high').length * 10;
    score -= activeAlerts.filter(a => a.severity === 'medium').length * 5;
    score -= activeAlerts.filter(a => a.severity === 'low').length * 2;
    
    const errorRate = this.calculateTraceErrorRate();
    score -= Math.min(errorRate * 2, 30);
    
    return Math.max(score, 0);
  }

  // 🔧 Configuration
  addCustomMetric(name: string, type: Metric['type']): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
      console.log(`✅ Custom metric added: ${name}`);
    }
  }

  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
    console.log(`🚨 Alert rule added: ${rule.name}`);
  }
}

interface AlertRule {
  name: string;
  condition: string;
  severity: Alert['severity'];
  description: string;
}

interface MetricCollector {
  name: string;
  interval: number;
  collect: () => void;
}

// 🏰 Integração com Torre Suprema
export function integrateObservabilityWithTorreSuprema(orchestrator: any) {
  const observability = new TorreSupremaObservabilityEngine();
  
  // Integrar com o orchestrador existente
  orchestrator.observability = observability;
  
  // Instrumentar tarefas com tracing
  const originalSubmitTask = orchestrator.submitTask;
  orchestrator.submitTask = async function(task: any) {
    const spanId = observability.startTrace(`task_${task.type}`);
    observability.addTraceTags(spanId, { 
      taskType: task.type, 
      priority: task.priority 
    });
    
    try {
      const result = await originalSubmitTask.call(this, task);
      observability.recordMetric('torre_suprema_tasks_submitted', 'counter', 1, {
        type: task.type,
        priority: task.priority
      });
      observability.finishTrace(spanId);
      return result;
    } catch (error: any) {
      observability.finishTrace(spanId, error);
      throw error;
    }
  };

  // Adicionar comandos de observabilidade
  orchestrator.observabilityCommands = {
    metrics: () => observability.getObservabilityMetrics(),
    
    profile: (component: string, fn: string, func: () => any) => {
      return observability.profileFunction(component, fn, func);
    },
    
    trace: (operation: string) => observability.startTrace(operation),
    
    addMetric: (name: string, type: string) => {
      observability.addCustomMetric(name, type as Metric['type']);
    }
  };

  console.log('📊 Observability Engine integrated with Torre Suprema!');
  return observability;
}