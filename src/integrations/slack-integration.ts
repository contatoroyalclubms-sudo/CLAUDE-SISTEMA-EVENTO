/**
 * 📧 TORRE SUPREMA SLACK INTEGRATION
 * Sistema de notificações automáticas via Slack
 */

import * as https from 'https';

export interface SlackMessage {
  channel: string;
  text: string;
  username?: string;
  iconEmoji?: string;
  attachments?: SlackAttachment[];
}

export interface SlackAttachment {
  color: string;
  title: string;
  text: string;
  fields?: SlackField[];
  timestamp?: number;
}

export interface SlackField {
  title: string;
  value: string;
  short?: boolean;
}

export interface SlackNotificationConfig {
  webhookUrl: string;
  defaultChannel: string;
  username: string;
  iconEmoji: string;
  enabled: boolean;
}

export class TorreSupremaSlackIntegration {
  private config: SlackNotificationConfig;
  private rateLimitQueue: Array<() => void> = [];
  private isProcessingQueue = false;

  constructor() {
    this.config = {
      webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
      defaultChannel: '#torre-suprema',
      username: 'Torre Suprema Bot',
      iconEmoji: ':robot_face:',
      enabled: !!process.env.SLACK_WEBHOOK_URL
    };

    console.log('📧 Torre Suprema Slack Integration INITIALIZED');
    if (!this.config.enabled) {
      console.log('⚠️ Slack integration disabled - no webhook URL configured');
    }
  }

  // 📨 ENVIO DE NOTIFICAÇÕES
  async sendNotification(message: Partial<SlackMessage>): Promise<boolean> {
    if (!this.config.enabled) {
      console.log('📧 Slack notification skipped (disabled):', message.text);
      return false;
    }

    const slackMessage: SlackMessage = {
      channel: message.channel || this.config.defaultChannel,
      text: message.text || '',
      username: message.username || this.config.username,
      iconEmoji: message.iconEmoji || this.config.iconEmoji,
      attachments: message.attachments || []
    };

    return this.sendToSlack(slackMessage);
  }

  // 🚨 NOTIFICAÇÕES DE SISTEMA
  async notifySystemEvent(event: string, details: any): Promise<boolean> {
    const color = this.getEventColor(event);
    const attachment: SlackAttachment = {
      color: color,
      title: `🏰 Torre Suprema System Event`,
      text: event,
      fields: [
        {
          title: 'Event Type',
          value: event,
          short: true
        },
        {
          title: 'Timestamp',
          value: new Date().toISOString(),
          short: true
        },
        {
          title: 'Details',
          value: JSON.stringify(details, null, 2),
          short: false
        }
      ],
      timestamp: Math.floor(Date.now() / 1000)
    };

    return this.sendNotification({
      text: `System Event: ${event}`,
      attachments: [attachment]
    });
  }

  // ⚡ NOTIFICAÇÕES DE PERFORMANCE
  async notifyPerformanceAlert(metric: string, value: number, threshold: number): Promise<boolean> {
    const isWarning = value >= threshold * 0.8;
    const isCritical = value >= threshold;
    
    const color = isCritical ? 'danger' : isWarning ? 'warning' : 'good';
    const emoji = isCritical ? '🚨' : isWarning ? '⚠️' : '✅';

    const attachment: SlackAttachment = {
      color: color,
      title: `${emoji} Performance Alert: ${metric}`,
      text: `Metric ${metric} is at ${value} (threshold: ${threshold})`,
      fields: [
        {
          title: 'Metric',
          value: metric,
          short: true
        },
        {
          title: 'Current Value',
          value: value.toString(),
          short: true
        },
        {
          title: 'Threshold',
          value: threshold.toString(),
          short: true
        },
        {
          title: 'Status',
          value: isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'OK',
          short: true
        }
      ],
      timestamp: Math.floor(Date.now() / 1000)
    };

    return this.sendNotification({
      text: `${emoji} Performance Alert: ${metric}`,
      attachments: [attachment]
    });
  }

  // 🤖 NOTIFICAÇÕES DE AGENTES
  async notifyAgentEvent(agentId: string, event: string, taskId?: string, result?: any): Promise<boolean> {
    const attachment: SlackAttachment = {
      color: 'good',
      title: `🤖 Agent Event: ${agentId}`,
      text: event,
      fields: [
        {
          title: 'Agent ID',
          value: agentId,
          short: true
        },
        {
          title: 'Event',
          value: event,
          short: true
        }
      ],
      timestamp: Math.floor(Date.now() / 1000)
    };

    if (taskId) {
      attachment.fields?.push({
        title: 'Task ID',
        value: taskId,
        short: true
      });
    }

    if (result) {
      attachment.fields?.push({
        title: 'Result',
        value: JSON.stringify(result, null, 2),
        short: false
      });
    }

    return this.sendNotification({
      text: `🤖 Agent ${agentId}: ${event}`,
      attachments: [attachment]
    });
  }

  // 🔒 NOTIFICAÇÕES DE SEGURANÇA
  async notifySecurityEvent(eventType: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any): Promise<boolean> {
    const colors = {
      low: 'good',
      medium: 'warning', 
      high: '#ff8c00',
      critical: 'danger'
    };

    const emojis = {
      low: '🔵',
      medium: '🟡', 
      high: '🟠',
      critical: '🔴'
    };

    const attachment: SlackAttachment = {
      color: colors[severity],
      title: `${emojis[severity]} Security Event: ${eventType}`,
      text: `Severity: ${severity.toUpperCase()}`,
      fields: [
        {
          title: 'Event Type',
          value: eventType,
          short: true
        },
        {
          title: 'Severity',
          value: severity.toUpperCase(),
          short: true
        },
        {
          title: 'Details',
          value: JSON.stringify(details, null, 2),
          short: false
        }
      ],
      timestamp: Math.floor(Date.now() / 1000)
    };

    return this.sendNotification({
      text: `🔒 Security Alert: ${eventType} (${severity})`,
      attachments: [attachment]
    });
  }

  // 💰 NOTIFICAÇÕES DE BILLING
  async notifyBillingEvent(event: string, amount: number, currency: string = 'USD'): Promise<boolean> {
    const attachment: SlackAttachment = {
      color: 'good',
      title: `💰 Billing Event: ${event}`,
      text: `Amount: ${currency} ${amount.toFixed(2)}`,
      fields: [
        {
          title: 'Event',
          value: event,
          short: true
        },
        {
          title: 'Amount',
          value: `${currency} ${amount.toFixed(2)}`,
          short: true
        },
        {
          title: 'Date',
          value: new Date().toISOString().split('T')[0],
          short: true
        }
      ],
      timestamp: Math.floor(Date.now() / 1000)
    };

    return this.sendNotification({
      text: `💰 Billing: ${event}`,
      attachments: [attachment]
    });
  }

  // 🚀 NOTIFICAÇÕES DE DEPLOY
  async notifyDeployment(environment: string, version: string, status: 'started' | 'success' | 'failed'): Promise<boolean> {
    const colors = {
      started: '#0066cc',
      success: 'good',
      failed: 'danger'
    };

    const emojis = {
      started: '🚀',
      success: '✅',
      failed: '❌'
    };

    const attachment: SlackAttachment = {
      color: colors[status],
      title: `${emojis[status]} Deployment ${status}`,
      text: `Environment: ${environment} | Version: ${version}`,
      fields: [
        {
          title: 'Environment',
          value: environment,
          short: true
        },
        {
          title: 'Version',
          value: version,
          short: true
        },
        {
          title: 'Status',
          value: status.toUpperCase(),
          short: true
        }
      ],
      timestamp: Math.floor(Date.now() / 1000)
    };

    return this.sendNotification({
      text: `🚀 Deployment ${status}: ${environment} v${version}`,
      attachments: [attachment]
    });
  }

  // 📊 RELATÓRIOS DIÁRIOS
  async sendDailyReport(stats: any): Promise<boolean> {
    const attachment: SlackAttachment = {
      color: 'good',
      title: '📊 Torre Suprema Daily Report',
      text: 'Sistema operando com excelência!',
      fields: [
        {
          title: 'Health Score',
          value: `${stats.healthScore}/100`,
          short: true
        },
        {
          title: 'Tasks Completed',
          value: stats.tasksCompleted.toString(),
          short: true
        },
        {
          title: 'Avg Response Time',
          value: `${stats.avgResponseTime}ms`,
          short: true
        },
        {
          title: 'Uptime',
          value: `${stats.uptime}%`,
          short: true
        },
        {
          title: 'Memory Usage',
          value: `${stats.memoryUsage}%`,
          short: true
        },
        {
          title: 'Active Agents',
          value: stats.activeAgents.toString(),
          short: true
        }
      ],
      timestamp: Math.floor(Date.now() / 1000)
    };

    return this.sendNotification({
      text: '📊 Daily Report - Torre Suprema Enterprise',
      attachments: [attachment]
    });
  }

  // 🔧 MÉTODOS PRIVADOS
  private async sendToSlack(message: SlackMessage): Promise<boolean> {
    return new Promise((resolve) => {
      this.rateLimitQueue.push(async () => {
        try {
          const payload = JSON.stringify(message);
          const url = new URL(this.config.webhookUrl);

          const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload)
            }
          };

          const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
              if (res.statusCode === 200) {
                console.log('✅ Slack notification sent successfully');
                resolve(true);
              } else {
                console.error('❌ Slack notification failed:', res.statusCode, data);
                resolve(false);
              }
            });
          });

          req.on('error', (error) => {
            console.error('❌ Slack request error:', error);
            resolve(false);
          });

          req.write(payload);
          req.end();

        } catch (error) {
          console.error('❌ Slack notification error:', error);
          resolve(false);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.rateLimitQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.rateLimitQueue.length > 0) {
      const task = this.rateLimitQueue.shift();
      if (task) {
        await task();
        // Rate limiting: 1 mensagem por segundo
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.isProcessingQueue = false;
  }

  private getEventColor(event: string): string {
    const eventColors: { [key: string]: string } = {
      'system_start': 'good',
      'system_stop': '#ff8c00',
      'error': 'danger',
      'warning': 'warning',
      'info': '#0066cc',
      'success': 'good',
      'agent_created': 'good',
      'task_completed': 'good',
      'performance_issue': 'warning',
      'security_breach': 'danger'
    };

    return eventColors[event] || '#0066cc';
  }

  // 🎯 CONFIGURAÇÕES
  updateConfig(newConfig: Partial<SlackNotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Slack configuration updated');
  }

  // 📊 STATUS
  getStatus() {
    return {
      enabled: this.config.enabled,
      webhookConfigured: !!this.config.webhookUrl,
      defaultChannel: this.config.defaultChannel,
      username: this.config.username,
      queueSize: this.rateLimitQueue.length,
      isProcessing: this.isProcessingQueue
    };
  }

  // 🧪 TESTE
  async testConnection(): Promise<boolean> {
    return this.sendNotification({
      text: '🧪 Torre Suprema Slack Integration Test',
      attachments: [{
        color: 'good',
        title: '✅ Test Successful',
        text: 'Slack integration is working correctly!',
        timestamp: Math.floor(Date.now() / 1000)
      }]
    });
  }
}

export const slackIntegration = new TorreSupremaSlackIntegration();