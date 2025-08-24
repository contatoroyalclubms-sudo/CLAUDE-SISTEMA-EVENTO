import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Zap, 
  Database, 
  Globe, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Brain,
  Shield,
  Rocket
} from 'lucide-react';

interface AgentStatus {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'busy' | 'offline';
  currentTask?: string;
  performance: {
    tasksCompleted: number;
    averageTime: number;
    successRate: number;
  };
}

interface MCPServerStatus {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  operations: number;
  responseTime: number;
}

interface SystemMetrics {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  systemLoad: number;
  uptime: number;
}

interface DashboardProps {
  className?: string;
}

export const TorreSupremaDashboard: React.FC<DashboardProps> = ({ className = '' }) => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [mcpServers, setMcpServers] = useState<MCPServerStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    systemLoad: 0,
    uptime: 0
  });
  const [realTimeData, setRealTimeData] = useState<any[]>([]);

  useEffect(() => {
    // Initialize dashboard data
    initializeDashboard();
    
    // Setup real-time updates
    const interval = setInterval(() => {
      updateDashboardData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const initializeDashboard = () => {
    // Initialize with mock data - in real app, this would connect to backend
    setAgents([
      {
        id: 'backend-dev-001',
        name: 'Backend Dev Specialist',
        type: 'development',
        status: 'busy',
        currentTask: 'API optimization',
        performance: { tasksCompleted: 47, averageTime: 1250, successRate: 96.2 }
      },
      {
        id: 'frontend-dev-001',
        name: 'Frontend Dev Expert',
        type: 'development',
        status: 'idle',
        performance: { tasksCompleted: 52, averageTime: 980, successRate: 94.8 }
      },
      {
        id: 'devops-001',
        name: 'DevOps Master',
        type: 'deployment',
        status: 'busy',
        currentTask: 'Container orchestration',
        performance: { tasksCompleted: 31, averageTime: 2100, successRate: 98.4 }
      },
      {
        id: 'design-001',
        name: 'Design Genius',
        type: 'design',
        status: 'idle',
        performance: { tasksCompleted: 28, averageTime: 1850, successRate: 97.1 }
      },
      {
        id: 'qa-001',
        name: 'QA Guardian',
        type: 'testing',
        status: 'busy',
        currentTask: 'Automated test suite',
        performance: { tasksCompleted: 39, averageTime: 1450, successRate: 99.2 }
      },
      {
        id: 'data-analyst-001',
        name: 'Data Intelligence',
        type: 'analysis',
        status: 'busy',
        currentTask: 'Performance analytics',
        performance: { tasksCompleted: 71, averageTime: 3200, successRate: 95.7 }
      }
    ]);

    setMcpServers([
      { id: 'github_mcp', name: 'GitHub', status: 'connected', operations: 156, responseTime: 89 },
      { id: 'slack_mcp', name: 'Slack', status: 'connected', operations: 73, responseTime: 142 },
      { id: 'notion_mcp', name: 'Notion', status: 'connected', operations: 41, responseTime: 218 },
      { id: 'figma_mcp', name: 'Figma', status: 'connected', operations: 28, responseTime: 167 },
      { id: 'postgres_mcp', name: 'PostgreSQL', status: 'connected', operations: 284, responseTime: 45 },
      { id: 'docker_mcp', name: 'Docker', status: 'connected', operations: 92, responseTime: 123 },
      { id: 'cloudflare_mcp', name: 'Cloudflare', status: 'connected', operations: 67, responseTime: 178 },
      { id: 'vercel_mcp', name: 'Vercel', status: 'connected', operations: 34, responseTime: 201 }
    ]);

    setMetrics({
      totalTasks: 347,
      activeTasks: 12,
      completedTasks: 328,
      failedTasks: 7,
      systemLoad: 67.3,
      uptime: 99.97
    });
  };

  const updateDashboardData = () => {
    // Simulate real-time updates
    setMetrics(prev => ({
      ...prev,
      systemLoad: Math.max(20, Math.min(95, prev.systemLoad + (Math.random() - 0.5) * 5)),
      activeTasks: Math.max(0, prev.activeTasks + Math.floor((Math.random() - 0.6) * 3))
    }));

    // Add real-time activity
    if (Math.random() < 0.3) {
      const activities = [
        'Task completed by Backend Dev Specialist',
        'New MCP operation executed on GitHub',
        'Performance metrics updated',
        'Agent status synchronized',
        'Deployment pipeline triggered',
        'Quality check passed',
        'Database query optimized',
        'Security scan completed'
      ];
      
      const newActivity = {
        id: Date.now(),
        message: activities[Math.floor(Math.random() * activities.length)],
        timestamp: new Date(),
        type: ['success', 'info', 'warning'][Math.floor(Math.random() * 3)]
      };
      
      setRealTimeData(prev => [newActivity, ...prev.slice(0, 49)]);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'connected':
      case 'idle':
      case 'completed':
        return 'text-green-400';
      case 'busy':
      case 'processing':
        return 'text-yellow-400';
      case 'disconnected':
      case 'offline':
      case 'failed':
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'busy':
      case 'processing':
        return <Clock className="w-4 h-4 animate-spin" />;
      case 'error':
      case 'failed':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🏰 Torre Suprema Command Center
            </h1>
            <p className="text-gray-300 mt-2">MCP Supreme Agency - Real-time Orchestration Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">System Uptime</div>
              <div className="text-xl font-bold text-green-400">{metrics.uptime}%</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold">{metrics.totalTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Tasks</p>
              <p className="text-2xl font-bold text-yellow-400">{metrics.activeTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-green-400">
                {((metrics.completedTasks / metrics.totalTasks) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">System Load</p>
              <p className="text-2xl font-bold">{metrics.systemLoad.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Server className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.systemLoad}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents Status */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              Supreme Agents
            </h2>
            <div className="text-sm text-gray-400">
              {agents.filter(a => a.status === 'busy').length} Active • {agents.filter(a => a.status === 'idle').length} Idle
            </div>
          </div>
          
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      agent.status === 'busy' ? 'bg-yellow-400' : 
                      agent.status === 'idle' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{agent.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {agent.status === 'busy' ? agent.currentTask : agent.status.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {agent.performance.tasksCompleted} tasks • {agent.performance.successRate}% success
                    </div>
                  </div>
                </div>
                
                {/* Performance Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Performance</span>
                    <span>{agent.performance.successRate}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${agent.performance.successRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold flex items-center mb-6">
            <Brain className="w-5 h-5 mr-2 text-purple-400" />
            Live Activity
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {realTimeData.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-900/30">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {realTimeData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Monitoring system activity...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MCP Servers Grid */}
      <div className="mt-8">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold flex items-center mb-6">
            <Globe className="w-5 h-5 mr-2 text-green-400" />
            MCP Integration Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mcpServers.map((server) => (
              <div key={server.id} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{server.name}</h3>
                  <div className={getStatusColor(server.status)}>
                    {getStatusIcon(server.status)}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className={`capitalize ${getStatusColor(server.status)}`}>
                      {server.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Operations</span>
                    <span>{server.operations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Response</span>
                    <span className={server.responseTime < 200 ? 'text-green-400' : 'text-yellow-400'}>
                      {server.responseTime}ms
                    </span>
                  </div>
                </div>
                
                {/* Connection strength indicator */}
                <div className="mt-3">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <div
                        key={bar}
                        className={`h-2 flex-1 rounded ${
                          server.status === 'connected' && server.responseTime < 50 * bar
                            ? 'bg-green-400'
                            : server.status === 'connected' && server.responseTime < 100 * bar
                            ? 'bg-yellow-400'
                            : 'bg-gray-700'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Command Center Actions */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Rocket className="w-5 h-5 mr-2 text-blue-400" />
              Torre Suprema Commands
            </h2>
            <div className="text-sm text-blue-300">Ready for Supreme Operations</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-lg p-4 text-left transition-colors">
              <div className="font-semibold text-blue-400">Deploy Project</div>
              <div className="text-sm text-gray-300 mt-1">Full-stack deployment with coordination</div>
            </button>
            
            <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg p-4 text-left transition-colors">
              <div className="font-semibold text-purple-400">Analysis Report</div>
              <div className="text-sm text-gray-300 mt-1">Generate comprehensive system report</div>
            </button>
            
            <button className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 rounded-lg p-4 text-left transition-colors">
              <div className="font-semibold text-green-400">Emergency Protocol</div>
              <div className="text-sm text-gray-300 mt-1">Activate emergency response procedures</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TorreSupremaDashboard;