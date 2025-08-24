/**
 * 📊 TORRE SUPREMA ANALYTICS DASHBOARD
 * Sistema de dashboards customizados com métricas em tempo real
 */

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'gauge' | 'heatmap' | 'timeline';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: any;
  dataSource: string;
  refreshRate: number; // seconds
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'flow';
  theme: 'light' | 'dark' | 'auto';
  isPublic: boolean;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MetricData {
  timestamp: number;
  value: number;
  metadata?: { [key: string]: any };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }>;
}

export interface DashboardTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: string;
    surface: string;
    text: string;
  };
}

export class TorreSupremaAnalyticsDashboard {
  private dashboards: Map<string, Dashboard> = new Map();
  private metrics: Map<string, MetricData[]> = new Map();
  private server?: http.Server;
  private port: number = 8080;
  private themes: Map<string, DashboardTheme> = new Map();
  private websockets: Set<any> = new Set();

  constructor() {
    console.log('📊 Torre Suprema Analytics Dashboard INITIALIZED');
    this.initializeThemes();
    this.createDefaultDashboards();
    this.startMetricsCollection();
  }

  // 🎨 INICIALIZAR TEMAS
  private initializeThemes(): void {
    // Light Theme
    this.themes.set('light', {
      name: 'Light',
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#343a40'
      }
    });

    // Dark Theme
    this.themes.set('dark', {
      name: 'Dark',
      colors: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        success: '#198754',
        warning: '#fd7e14',
        danger: '#dc3545',
        info: '#0dcaf0',
        background: '#121212',
        surface: '#1e1e1e',
        text: '#ffffff'
      }
    });

    // Torre Suprema Theme
    this.themes.set('torre-suprema', {
      name: 'Torre Suprema',
      colors: {
        primary: '#6f42c1',
        secondary: '#fd7e14',
        success: '#20c997',
        warning: '#ffc107',
        danger: '#e74c3c',
        info: '#3498db',
        background: '#0a0a0a',
        surface: '#1a1a2e',
        text: '#eee'
      }
    });
  }

  // 📊 CRIAR DASHBOARDS PADRÃO
  private createDefaultDashboards(): void {
    // Dashboard Principal - Torre Suprema Overview
    const mainDashboard: Dashboard = {
      id: 'main-overview',
      name: 'Torre Suprema Overview',
      description: 'Visão geral do sistema Torre Suprema Enterprise',
      layout: 'grid',
      theme: 'torre-suprema',
      isPublic: true,
      owner: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      widgets: [
        {
          id: 'health-score',
          type: 'gauge',
          title: 'System Health Score',
          position: { x: 0, y: 0, w: 6, h: 4 },
          dataSource: 'system.health',
          refreshRate: 30,
          config: {
            min: 0,
            max: 100,
            thresholds: [
              { value: 80, color: '#28a745' },
              { value: 60, color: '#ffc107' },
              { value: 0, color: '#dc3545' }
            ]
          }
        },
        {
          id: 'response-time',
          type: 'chart',
          title: 'Average Response Time (ms)',
          position: { x: 6, y: 0, w: 6, h: 4 },
          dataSource: 'performance.response_time',
          refreshRate: 10,
          config: {
            type: 'line',
            timeRange: '1h',
            yAxis: { min: 0, max: 100 }
          }
        },
        {
          id: 'active-agents',
          type: 'metric',
          title: 'Active Agents',
          position: { x: 0, y: 4, w: 3, h: 2 },
          dataSource: 'agents.active_count',
          refreshRate: 30,
          config: {
            format: 'number',
            icon: '🤖'
          }
        },
        {
          id: 'tasks-completed',
          type: 'metric',
          title: 'Tasks Completed Today',
          position: { x: 3, y: 4, w: 3, h: 2 },
          dataSource: 'tasks.completed_today',
          refreshRate: 60,
          config: {
            format: 'number',
            icon: '✅'
          }
        },
        {
          id: 'memory-usage',
          type: 'gauge',
          title: 'Memory Usage',
          position: { x: 6, y: 4, w: 3, h: 2 },
          dataSource: 'system.memory_usage',
          refreshRate: 15,
          config: {
            min: 0,
            max: 100,
            format: 'percentage'
          }
        },
        {
          id: 'error-rate',
          type: 'metric',
          title: 'Error Rate',
          position: { x: 9, y: 4, w: 3, h: 2 },
          dataSource: 'performance.error_rate',
          refreshRate: 30,
          config: {
            format: 'percentage',
            icon: '⚠️',
            threshold: { value: 1, operator: '>' }
          }
        },
        {
          id: 'top-agents',
          type: 'table',
          title: 'Top Performing Agents',
          position: { x: 0, y: 6, w: 6, h: 4 },
          dataSource: 'agents.performance_ranking',
          refreshRate: 300,
          config: {
            columns: ['Agent', 'Tasks', 'Avg Time', 'Success Rate'],
            sortBy: 'Tasks',
            limit: 10
          }
        },
        {
          id: 'system-events',
          type: 'timeline',
          title: 'Recent System Events',
          position: { x: 6, y: 6, w: 6, h: 4 },
          dataSource: 'system.events',
          refreshRate: 60,
          config: {
            timeRange: '4h',
            eventTypes: ['info', 'warning', 'error'],
            limit: 20
          }
        }
      ]
    };

    // Dashboard de Performance
    const performanceDashboard: Dashboard = {
      id: 'performance-monitoring',
      name: 'Performance Monitoring',
      description: 'Monitoramento detalhado de performance do sistema',
      layout: 'grid',
      theme: 'dark',
      isPublic: true,
      owner: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      widgets: [
        {
          id: 'cpu-usage',
          type: 'chart',
          title: 'CPU Usage (%)',
          position: { x: 0, y: 0, w: 4, h: 3 },
          dataSource: 'system.cpu_usage',
          refreshRate: 5,
          config: {
            type: 'area',
            timeRange: '30m',
            yAxis: { min: 0, max: 100 }
          }
        },
        {
          id: 'memory-usage-detail',
          type: 'chart',
          title: 'Memory Usage (MB)',
          position: { x: 4, y: 0, w: 4, h: 3 },
          dataSource: 'system.memory_usage_mb',
          refreshRate: 5,
          config: {
            type: 'area',
            timeRange: '30m'
          }
        },
        {
          id: 'network-io',
          type: 'chart',
          title: 'Network I/O (KB/s)',
          position: { x: 8, y: 0, w: 4, h: 3 },
          dataSource: 'system.network_io',
          refreshRate: 5,
          config: {
            type: 'line',
            timeRange: '30m',
            datasets: ['in', 'out']
          }
        },
        {
          id: 'response-time-heatmap',
          type: 'heatmap',
          title: 'Response Time Heatmap',
          position: { x: 0, y: 3, w: 8, h: 4 },
          dataSource: 'performance.response_time_heatmap',
          refreshRate: 60,
          config: {
            timeRange: '24h',
            buckets: 24,
            colorScheme: 'blues'
          }
        },
        {
          id: 'throughput',
          type: 'metric',
          title: 'Current Throughput',
          position: { x: 8, y: 3, w: 4, h: 2 },
          dataSource: 'performance.throughput',
          refreshRate: 10,
          config: {
            format: 'requests_per_second',
            icon: '⚡'
          }
        },
        {
          id: 'concurrent-users',
          type: 'metric',
          title: 'Concurrent Users',
          position: { x: 8, y: 5, w: 4, h: 2 },
          dataSource: 'users.concurrent',
          refreshRate: 30,
          config: {
            format: 'number',
            icon: '👥'
          }
        }
      ]
    };

    this.dashboards.set(mainDashboard.id, mainDashboard);
    this.dashboards.set(performanceDashboard.id, performanceDashboard);

    console.log(`📊 ${this.dashboards.size} default dashboards created`);
  }

  // 📈 COLETA DE MÉTRICAS
  private startMetricsCollection(): void {
    console.log('📈 Starting metrics collection...');

    // Simular coleta de métricas em tempo real
    setInterval(() => {
      this.collectSystemMetrics();
    }, 5000); // A cada 5 segundos

    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 10000); // A cada 10 segundos

    setInterval(() => {
      this.collectBusinessMetrics();
    }, 30000); // A cada 30 segundos
  }

  private collectSystemMetrics(): void {
    const now = Date.now();
    
    // System Health
    this.addMetric('system.health', {
      timestamp: now,
      value: 85 + Math.random() * 15, // 85-100
      metadata: { status: 'healthy' }
    });

    // CPU Usage
    this.addMetric('system.cpu_usage', {
      timestamp: now,
      value: 20 + Math.random() * 30, // 20-50%
      metadata: { cores: 8 }
    });

    // Memory Usage
    this.addMetric('system.memory_usage', {
      timestamp: now,
      value: 40 + Math.random() * 30, // 40-70%
      metadata: { total_gb: 32 }
    });

    this.addMetric('system.memory_usage_mb', {
      timestamp: now,
      value: (40 + Math.random() * 30) * 32 * 10.24, // MB
      metadata: { total_mb: 32768 }
    });
  }

  private collectPerformanceMetrics(): void {
    const now = Date.now();

    // Response Time
    this.addMetric('performance.response_time', {
      timestamp: now,
      value: 15 + Math.random() * 20, // 15-35ms
      metadata: { sla: 50 }
    });

    // Error Rate
    this.addMetric('performance.error_rate', {
      timestamp: now,
      value: Math.random() * 0.5, // 0-0.5%
      metadata: { total_requests: 10000 }
    });

    // Throughput
    this.addMetric('performance.throughput', {
      timestamp: now,
      value: 8000 + Math.random() * 4000, // 8000-12000 req/s
      metadata: { peak: 15000 }
    });
  }

  private collectBusinessMetrics(): void {
    const now = Date.now();

    // Active Agents
    this.addMetric('agents.active_count', {
      timestamp: now,
      value: 5 + Math.floor(Math.random() * 3), // 5-7 agents
      metadata: { total_available: 10 }
    });

    // Tasks Completed
    this.addMetric('tasks.completed_today', {
      timestamp: now,
      value: 450 + Math.floor(Math.random() * 100), // 450-550 tasks
      metadata: { pending: 25 }
    });

    // Concurrent Users
    this.addMetric('users.concurrent', {
      timestamp: now,
      value: 12000 + Math.floor(Math.random() * 8000), // 12K-20K users
      metadata: { peak_today: 25000 }
    });
  }

  // 📊 GERENCIAMENTO DE MÉTRICAS
  private addMetric(source: string, data: MetricData): void {
    if (!this.metrics.has(source)) {
      this.metrics.set(source, []);
    }

    const metrics = this.metrics.get(source)!;
    metrics.push(data);

    // Manter apenas os últimos 1000 pontos por métrica
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }
  }

  // 🌐 SERVIDOR WEB
  async startWebServer(port: number = 8080): Promise<void> {
    this.port = port;

    this.server = http.createServer((req, res) => {
      this.handleHttpRequest(req, res);
    });

    this.server.listen(port, () => {
      console.log(`🌐 Analytics Dashboard server started on http://localhost:${port}`);
    });
  }

  private async handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://localhost:${this.port}`);
    const path = url.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      if (path === '/' || path === '/dashboard') {
        this.serveMainDashboard(res);
      } else if (path.startsWith('/api/dashboards')) {
        await this.handleDashboardApi(req, res, url);
      } else if (path.startsWith('/api/metrics')) {
        await this.handleMetricsApi(req, res, url);
      } else if (path.startsWith('/api/widgets')) {
        await this.handleWidgetsApi(req, res, url);
      } else {
        this.serve404(res);
      }
    } catch (error) {
      console.error('❌ Dashboard server error:', error);
      this.serveError(res, 500, 'Internal Server Error');
    }
  }

  private serveMainDashboard(res: http.ServerResponse): void {
    const html = this.generateDashboardHTML();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  private async handleDashboardApi(req: http.IncomingMessage, res: http.ServerResponse, url: URL): Promise<void> {
    const pathParts = url.pathname.split('/');
    const dashboardId = pathParts[3];

    if (req.method === 'GET') {
      if (dashboardId) {
        // Get specific dashboard
        const dashboard = this.dashboards.get(dashboardId);
        if (dashboard) {
          this.sendJson(res, dashboard);
        } else {
          this.serveError(res, 404, 'Dashboard not found');
        }
      } else {
        // List all dashboards
        this.sendJson(res, Array.from(this.dashboards.values()));
      }
    } else if (req.method === 'POST' && !dashboardId) {
      // Create new dashboard
      const body = await this.readRequestBody(req);
      const dashboard: Dashboard = JSON.parse(body);
      dashboard.id = dashboard.id || this.generateId();
      dashboard.createdAt = new Date();
      dashboard.updatedAt = new Date();
      
      this.dashboards.set(dashboard.id, dashboard);
      this.sendJson(res, dashboard, 201);
    }
  }

  private async handleMetricsApi(req: http.IncomingMessage, res: http.ServerResponse, url: URL): Promise<void> {
    if (req.method === 'GET') {
      const source = url.searchParams.get('source');
      const timeRange = url.searchParams.get('timeRange') || '1h';
      
      if (source) {
        const metrics = this.getMetricsForSource(source, timeRange);
        this.sendJson(res, metrics);
      } else {
        // Return all available metric sources
        this.sendJson(res, Array.from(this.metrics.keys()));
      }
    }
  }

  private async handleWidgetsApi(req: http.IncomingMessage, res: http.ServerResponse, url: URL): Promise<void> {
    const pathParts = url.pathname.split('/');
    const widgetId = pathParts[3];

    if (req.method === 'GET' && widgetId === 'data') {
      const source = url.searchParams.get('source');
      const timeRange = url.searchParams.get('timeRange') || '1h';
      
      if (source) {
        const data = this.getWidgetData(source, timeRange);
        this.sendJson(res, data);
      } else {
        this.serveError(res, 400, 'Source parameter required');
      }
    }
  }

  // 📈 PROCESSAMENTO DE DADOS
  private getMetricsForSource(source: string, timeRange: string): MetricData[] {
    const metrics = this.metrics.get(source) || [];
    const now = Date.now();
    const timeRangeMs = this.parseTimeRange(timeRange);
    
    return metrics.filter(metric => metric.timestamp >= now - timeRangeMs);
  }

  private getWidgetData(source: string, timeRange: string): ChartData | number | any {
    const metrics = this.getMetricsForSource(source, timeRange);
    
    if (metrics.length === 0) {
      return null;
    }

    // Para métricas simples, retornar último valor
    if (source.includes('.count') || source.includes('.usage')) {
      return metrics[metrics.length - 1].value;
    }

    // Para charts, retornar série temporal
    return {
      labels: metrics.map(m => new Date(m.timestamp).toLocaleTimeString()),
      datasets: [{
        label: source,
        data: metrics.map(m => m.value),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true
      }]
    };
  }

  private parseTimeRange(timeRange: string): number {
    const unit = timeRange.slice(-1);
    const value = parseInt(timeRange.slice(0, -1));
    
    const multipliers: { [key: string]: number } = {
      'm': 60 * 1000,      // minutes
      'h': 60 * 60 * 1000,  // hours
      'd': 24 * 60 * 60 * 1000 // days
    };

    return value * (multipliers[unit] || multipliers['h']);
  }

  // 🎨 HTML GENERATION
  private generateDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Torre Suprema Analytics Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            color: #eee;
            min-height: 100vh;
        }
        
        .header {
            background: rgba(111, 66, 193, 0.1);
            border-bottom: 1px solid rgba(111, 66, 193, 0.3);
            padding: 1rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .header h1 {
            font-size: 2rem;
            background: linear-gradient(45deg, #6f42c1, #fd7e14);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .header .status {
            display: flex;
            gap: 2rem;
            font-size: 0.9rem;
        }
        
        .status-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #20c997;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 1rem;
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .widget {
            background: rgba(30, 30, 46, 0.8);
            border: 1px solid rgba(111, 66, 193, 0.2);
            border-radius: 12px;
            padding: 1.5rem;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }
        
        .widget:hover {
            border-color: rgba(111, 66, 193, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(111, 66, 193, 0.1);
        }
        
        .widget-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #fd7e14;
        }
        
        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #20c997;
            margin-bottom: 0.5rem;
        }
        
        .metric-label {
            font-size: 0.9rem;
            opacity: 0.7;
        }
        
        .chart-container {
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            color: #6c757d;
        }
        
        .gauge {
            position: relative;
            width: 120px;
            height: 120px;
            margin: 0 auto;
        }
        
        .gauge-circle {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: conic-gradient(#20c997 0deg 252deg, rgba(108, 117, 125, 0.2) 252deg);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .gauge-inner {
            width: 80%;
            height: 80%;
            background: #1a1a2e;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .gauge-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #20c997;
        }
        
        .gauge-label {
            font-size: 0.7rem;
            opacity: 0.7;
        }
        
        .w-6 { grid-column: span 6; }
        .w-4 { grid-column: span 4; }
        .w-3 { grid-column: span 3; }
        .w-8 { grid-column: span 8; }
        .w-12 { grid-column: span 12; }
        
        .h-4 { min-height: 300px; }
        .h-3 { min-height: 240px; }
        .h-2 { min-height: 180px; }
        
        .footer {
            text-align: center;
            padding: 2rem;
            opacity: 0.7;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .widget {
                grid-column: span 1 !important;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏰 Torre Suprema Analytics Dashboard</h1>
        <div class="status">
            <div class="status-item">
                <div class="status-dot"></div>
                <span>System Online</span>
            </div>
            <div class="status-item">
                <span>⚡ 18ms avg</span>
            </div>
            <div class="status-item">
                <span>🤖 5 agents</span>
            </div>
            <div class="status-item">
                <span id="current-time"></span>
            </div>
        </div>
    </div>
    
    <div class="dashboard-grid">
        <div class="widget w-6 h-4">
            <div class="widget-title">🏥 System Health Score</div>
            <div class="gauge">
                <div class="gauge-circle">
                    <div class="gauge-inner">
                        <div class="gauge-value" id="health-score">98</div>
                        <div class="gauge-label">/ 100</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="widget w-6 h-4">
            <div class="widget-title">⚡ Average Response Time</div>
            <div class="chart-container">
                📈 Real-time Chart
                <br><small>15-35ms range</small>
            </div>
        </div>
        
        <div class="widget w-3 h-2">
            <div class="widget-title">🤖 Active Agents</div>
            <div class="metric-value" id="active-agents">5</div>
            <div class="metric-label">of 10 available</div>
        </div>
        
        <div class="widget w-3 h-2">
            <div class="widget-title">✅ Tasks Today</div>
            <div class="metric-value" id="tasks-completed">1,247</div>
            <div class="metric-label">+12% vs yesterday</div>
        </div>
        
        <div class="widget w-3 h-2">
            <div class="widget-title">💾 Memory Usage</div>
            <div class="gauge" style="width: 80px; height: 80px;">
                <div class="gauge-circle">
                    <div class="gauge-inner">
                        <div class="gauge-value" style="font-size: 1rem;" id="memory-usage">67</div>
                        <div class="gauge-label">%</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="widget w-3 h-2">
            <div class="widget-title">⚠️ Error Rate</div>
            <div class="metric-value" style="color: #20c997;" id="error-rate">0.02</div>
            <div class="metric-label">% (target: <1%)</div>
        </div>
        
        <div class="widget w-8 h-4">
            <div class="widget-title">🏆 Top Performing Agents</div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(108, 117, 125, 0.3);">
                            <th style="text-align: left; padding: 0.5rem;">Agent</th>
                            <th style="text-align: center; padding: 0.5rem;">Tasks</th>
                            <th style="text-align: center; padding: 0.5rem;">Avg Time</th>
                            <th style="text-align: center; padding: 0.5rem;">Success Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 0.5rem;">🏛️ Architect Master</td>
                            <td style="text-align: center; padding: 0.5rem; color: #20c997;">342</td>
                            <td style="text-align: center; padding: 0.5rem;">23ms</td>
                            <td style="text-align: center; padding: 0.5rem; color: #20c997;">99.7%</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.5rem;">⚡ Backend Performance</td>
                            <td style="text-align: center; padding: 0.5rem; color: #20c997;">298</td>
                            <td style="text-align: center; padding: 0.5rem;">18ms</td>
                            <td style="text-align: center; padding: 0.5rem; color: #20c997;">99.9%</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.5rem;">🎯 General Purpose</td>
                            <td style="text-align: center; padding: 0.5rem; color: #20c997;">189</td>
                            <td style="text-align: center; padding: 0.5rem;">32ms</td>
                            <td style="text-align: center; padding: 0.5rem; color: #20c997;">98.9%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="widget w-4 h-4">
            <div class="widget-title">📋 Recent System Events</div>
            <div style="max-height: 200px; overflow-y: auto;">
                <div style="padding: 0.5rem 0; border-bottom: 1px solid rgba(108, 117, 125, 0.1);">
                    <div style="font-size: 0.9rem; color: #20c997;">✅ Agent deployment successful</div>
                    <div style="font-size: 0.8rem; opacity: 0.7;">2 minutes ago</div>
                </div>
                <div style="padding: 0.5rem 0; border-bottom: 1px solid rgba(108, 117, 125, 0.1);">
                    <div style="font-size: 0.9rem; color: #fd7e14;">⚠️ Memory usage spike detected</div>
                    <div style="font-size: 0.8rem; opacity: 0.7;">5 minutes ago</div>
                </div>
                <div style="padding: 0.5rem 0; border-bottom: 1px solid rgba(108, 117, 125, 0.1);">
                    <div style="font-size: 0.9rem; color: #20c997;">🔄 Auto-recovery completed</div>
                    <div style="font-size: 0.8rem; opacity: 0.7;">8 minutes ago</div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="footer">
        🏰 Torre Suprema Enterprise Analytics Dashboard v2.0.0 | 
        Real-time monitoring and visualization | 
        © 2025 Torre Suprema Team
    </div>
    
    <script>
        // Update current time
        function updateTime() {
            document.getElementById('current-time').textContent = new Date().toLocaleTimeString();
        }
        setInterval(updateTime, 1000);
        updateTime();
        
        // Simulate real-time data updates
        function simulateRealTimeUpdates() {
            // Health Score
            const healthScore = 85 + Math.floor(Math.random() * 15);
            document.getElementById('health-score').textContent = healthScore;
            
            // Active Agents
            const activeAgents = 5 + Math.floor(Math.random() * 3);
            document.getElementById('active-agents').textContent = activeAgents;
            
            // Tasks Completed
            const tasks = 1200 + Math.floor(Math.random() * 200);
            document.getElementById('tasks-completed').textContent = tasks.toLocaleString();
            
            // Memory Usage
            const memoryUsage = 60 + Math.floor(Math.random() * 20);
            document.getElementById('memory-usage').textContent = memoryUsage;
            
            // Error Rate
            const errorRate = (Math.random() * 0.1).toFixed(2);
            document.getElementById('error-rate').textContent = errorRate;
        }
        
        setInterval(simulateRealTimeUpdates, 5000);
        simulateRealTimeUpdates();
    </script>
</body>
</html>
    `;
  }

  // 🛠️ MÉTODOS AUXILIARES
  private sendJson(res: http.ServerResponse, data: any, statusCode: number = 200): void {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
  }

  private serveError(res: http.ServerResponse, statusCode: number, message: string): void {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }

  private serve404(res: http.ServerResponse): void {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }

  private async readRequestBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => resolve(body));
      req.on('error', reject);
    });
  }

  private generateId(): string {
    return 'dash_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 📊 API PÚBLICA
  createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = this.generateId();
    const newDashboard: Dashboard = {
      ...dashboard,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dashboards.set(id, newDashboard);
    console.log(`📊 Dashboard created: ${newDashboard.name} (${id})`);
    return id;
  }

  getDashboard(id: string): Dashboard | undefined {
    return this.dashboards.get(id);
  }

  listDashboards(): Dashboard[] {
    return Array.from(this.dashboards.values());
  }

  addCustomMetric(source: string, value: number, metadata?: any): void {
    this.addMetric(source, {
      timestamp: Date.now(),
      value,
      metadata
    });
  }

  // 📊 STATUS
  getStatus() {
    return {
      dashboards: this.dashboards.size,
      metrics: this.metrics.size,
      themes: this.themes.size,
      serverRunning: !!this.server,
      port: this.port,
      activeConnections: this.websockets.size
    };
  }

  // 🛑 SHUTDOWN
  async shutdown(): Promise<void> {
    if (this.server) {
      this.server.close();
      console.log('🛑 Analytics Dashboard server stopped');
    }
  }
}

export const analyticsDashboard = new TorreSupremaAnalyticsDashboard();