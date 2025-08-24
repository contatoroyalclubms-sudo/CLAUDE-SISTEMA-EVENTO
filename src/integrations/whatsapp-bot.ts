/**
 * 🤖 TORRE SUPREMA WHATSAPP BOT
 * Sistema de automação mobile via WhatsApp
 */

import * as https from 'https';
import * as crypto from 'crypto';

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';
  metadata?: { [key: string]: any };
}

export interface WhatsAppContact {
  id: string;
  phone: string;
  name: string;
  isBot: boolean;
  permissions: string[];
  lastInteraction: Date;
  totalMessages: number;
}

export interface BotCommand {
  command: string;
  description: string;
  handler: (message: WhatsAppMessage, args: string[]) => Promise<string>;
  permissions?: string[];
  cooldown?: number; // seconds
}

export interface WhatsAppConfig {
  apiUrl: string;
  apiToken: string;
  webhookSecret: string;
  phoneNumberId: string;
  businessAccountId: string;
  enabled: boolean;
}

export class TorreSupremaWhatsAppBot {
  private config: WhatsAppConfig;
  private contacts: Map<string, WhatsAppContact> = new Map();
  private commands: Map<string, BotCommand> = new Map();
  private messageHistory: Map<string, WhatsAppMessage[]> = new Map();
  private rateLimits: Map<string, number> = new Map();
  private webhookServer?: any;

  constructor() {
    this.config = {
      apiUrl: 'https://graph.facebook.com/v17.0',
      apiToken: process.env.WHATSAPP_API_TOKEN || '',
      webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      enabled: !!(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
    };

    console.log('🤖 Torre Suprema WhatsApp Bot INITIALIZED');
    if (!this.config.enabled) {
      console.log('⚠️ WhatsApp Bot disabled - missing configuration');
    } else {
      console.log('✅ WhatsApp Bot enabled for phone:', this.config.phoneNumberId);
    }

    this.initializeCommands();
  }

  // 🎯 INICIALIZAR COMANDOS
  private initializeCommands(): void {
    console.log('🎯 Initializing bot commands...');

    // Comando Help
    this.addCommand({
      command: 'help',
      description: 'Mostra todos os comandos disponíveis',
      handler: async (message, args) => {
        const commands = Array.from(this.commands.values());
        let response = '🏰 *Torre Suprema Bot Commands*\n\n';
        
        commands.forEach(cmd => {
          response += `*/${cmd.command}* - ${cmd.description}\n`;
        });
        
        response += '\n📞 Para suporte: /support';
        return response;
      }
    });

    // Comando Status
    this.addCommand({
      command: 'status',
      description: 'Mostra o status do sistema Torre Suprema',
      handler: async (message, args) => {
        // Simular dados do sistema
        const status = {
          health: 98,
          agents: 5,
          tasks: 1247,
          responseTime: 18,
          uptime: '99.99%'
        };

        return `🏰 *Torre Suprema System Status*\n\n` +
               `🏥 Health Score: ${status.health}/100\n` +
               `🤖 Active Agents: ${status.agents}\n` +
               `✅ Tasks Today: ${status.tasks}\n` +
               `⚡ Avg Response: ${status.responseTime}ms\n` +
               `📈 Uptime: ${status.uptime}\n\n` +
               `*Status: OPERATIONAL* ✅`;
      }
    });

    // Comando Task
    this.addCommand({
      command: 'task',
      description: 'Criar uma nova tarefa para os agentes',
      handler: async (message, args) => {
        if (args.length === 0) {
          return '❌ Uso: /task <descrição da tarefa>\n\nExemplo: /task criar uma API REST';
        }

        const taskDescription = args.join(' ');
        const taskId = 'task_' + Date.now();
        
        // Simular criação de tarefa
        return `✅ *Tarefa Criada!*\n\n` +
               `🆔 ID: ${taskId}\n` +
               `📋 Descrição: ${taskDescription}\n` +
               `🤖 Agente: Auto-selecionado\n` +
               `⏱️ Status: Em processamento\n\n` +
               `Você receberá uma notificação quando concluída!`;
      },
      permissions: ['task_create']
    });

    // Comando Metrics
    this.addCommand({
      command: 'metrics',
      description: 'Ver métricas do sistema em tempo real',
      handler: async (message, args) => {
        // Simular métricas em tempo real
        const metrics = {
          cpu: 32 + Math.floor(Math.random() * 20),
          memory: 67 + Math.floor(Math.random() * 10),
          requests: 8000 + Math.floor(Math.random() * 4000),
          errors: (Math.random() * 0.5).toFixed(2)
        };

        return `📊 *Sistema Metrics*\n\n` +
               `💻 CPU: ${metrics.cpu}%\n` +
               `💾 Memory: ${metrics.memory}%\n` +
               `⚡ Requests/s: ${metrics.requests}\n` +
               `❌ Error Rate: ${metrics.errors}%\n\n` +
               `📈 Dashboard: http://localhost:8080`;
      },
      permissions: ['metrics_view'],
      cooldown: 30
    });

    // Comando Deploy
    this.addCommand({
      command: 'deploy',
      description: 'Iniciar processo de deploy',
      handler: async (message, args) => {
        const environment = args[0] || 'staging';
        const version = args[1] || 'latest';

        if (!['staging', 'production'].includes(environment)) {
          return '❌ Ambiente inválido. Use: staging ou production';
        }

        // Simular deploy
        const deployId = 'deploy_' + Date.now();
        
        return `🚀 *Deploy Iniciado!*\n\n` +
               `🆔 Deploy ID: ${deployId}\n` +
               `🌍 Environment: ${environment}\n` +
               `📦 Version: ${version}\n` +
               `⏱️ Status: Running\n\n` +
               `Estimativa: 2-5 minutos`;
      },
      permissions: ['deploy'],
      cooldown: 60
    });

    // Comando Alert
    this.addCommand({
      command: 'alerts',
      description: 'Ver alertas ativos do sistema',
      handler: async (message, args) => {
        // Simular alertas
        const alerts = [
          { level: 'warning', message: 'High memory usage detected', time: '2 min ago' },
          { level: 'info', message: 'Agent deployment completed', time: '5 min ago' },
          { level: 'success', message: 'Auto-recovery successful', time: '10 min ago' }
        ];

        let response = '🚨 *System Alerts*\n\n';
        
        if (alerts.length === 0) {
          response += '✅ No active alerts\n\nSystem running smoothly!';
        } else {
          alerts.forEach(alert => {
            const emoji = alert.level === 'warning' ? '⚠️' : 
                         alert.level === 'success' ? '✅' : 'ℹ️';
            response += `${emoji} ${alert.message}\n📅 ${alert.time}\n\n`;
          });
        }

        return response;
      },
      permissions: ['alerts_view']
    });

    // Comando Support
    this.addCommand({
      command: 'support',
      description: 'Entrar em contato com suporte técnico',
      handler: async (message, args) => {
        const issue = args.join(' ');
        const ticketId = 'ticket_' + Date.now();

        return `🎫 *Ticket de Suporte Criado*\n\n` +
               `🆔 Ticket: ${ticketId}\n` +
               `📱 WhatsApp: ${message.from}\n` +
               `📋 Issue: ${issue || 'Suporte geral'}\n` +
               `⏱️ Status: Aberto\n\n` +
               `Nossa equipe entrará em contato em breve!\n\n` +
               `📧 Email: support@torre-suprema.dev\n` +
               `💬 Discord: Torre Suprema Community`;
      }
    });

    // Comando Projects
    this.addCommand({
      command: 'projects',
      description: 'Listar projetos integrados',
      handler: async (message, args) => {
        // Simular projetos
        const projects = [
          { name: 'E-commerce Platform', status: 'active', tasks: 42 },
          { name: 'API Gateway', status: 'maintenance', tasks: 12 },
          { name: 'Analytics Dashboard', status: 'active', tasks: 28 }
        ];

        let response = '🏗️ *Projetos Integrados*\n\n';
        
        projects.forEach(project => {
          const statusEmoji = project.status === 'active' ? '✅' : '🔧';
          response += `${statusEmoji} *${project.name}*\n`;
          response += `📊 Status: ${project.status}\n`;
          response += `📋 Tasks: ${project.tasks}\n\n`;
        });

        response += `Total: ${projects.length} projetos`;
        return response;
      },
      permissions: ['projects_view']
    });

    console.log(`🎯 ${this.commands.size} commands initialized`);
  }

  // 📨 ENVIO DE MENSAGENS
  async sendMessage(to: string, message: string, type: 'text' | 'image' = 'text'): Promise<boolean> {
    if (!this.config.enabled) {
      console.log('📨 WhatsApp message skipped (disabled):', message);
      return false;
    }

    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: type,
        [type]: type === 'text' ? { body: message } : message
      };

      const response = await this.makeApiRequest('POST', `/${this.config.phoneNumberId}/messages`, payload);
      
      if (response.messages && response.messages[0].id) {
        console.log('✅ WhatsApp message sent successfully:', response.messages[0].id);
        return true;
      } else {
        console.error('❌ WhatsApp message failed:', response);
        return false;
      }

    } catch (error) {
      console.error('❌ WhatsApp send error:', error);
      return false;
    }
  }

  // 📲 PROCESSAR MENSAGENS RECEBIDAS
  async processIncomingMessage(messageData: any): Promise<void> {
    try {
      const message = this.parseIncomingMessage(messageData);
      if (!message) return;

      console.log('📲 Processing message:', message.body, 'from:', message.from);

      // Adicionar contato se não existe
      await this.addOrUpdateContact(message.from, messageData.contacts?.[0]?.profile?.name || 'Unknown');

      // Salvar mensagem no histórico
      this.saveMessage(message);

      // Verificar rate limit
      if (this.isRateLimited(message.from)) {
        await this.sendMessage(message.from, '⏳ *Rate Limit*\n\nVocê está enviando muitas mensagens. Aguarde um momento.');
        return;
      }

      // Processar comando ou mensagem
      if (message.body.startsWith('/')) {
        await this.processCommand(message);
      } else {
        await this.processNaturalLanguage(message);
      }

    } catch (error) {
      console.error('❌ Error processing message:', error);
    }
  }

  // 🎯 PROCESSAR COMANDOS
  private async processCommand(message: WhatsAppMessage): Promise<void> {
    const parts = message.body.slice(1).split(' '); // Remove '/' and split
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const command = this.commands.get(commandName);
    
    if (!command) {
      await this.sendMessage(message.from, 
        '❌ *Comando não encontrado*\n\n' +
        'Digite /help para ver comandos disponíveis.'
      );
      return;
    }

    // Verificar permissões
    const contact = this.contacts.get(message.from);
    if (command.permissions && contact) {
      const hasPermission = command.permissions.some(perm => contact.permissions.includes(perm));
      if (!hasPermission) {
        await this.sendMessage(message.from, 
          '🔒 *Acesso Negado*\n\n' +
          'Você não tem permissão para este comando.'
        );
        return;
      }
    }

    // Verificar cooldown
    if (command.cooldown) {
      const cooldownKey = `${message.from}:${commandName}`;
      const lastUsed = this.rateLimits.get(cooldownKey) || 0;
      const now = Date.now();
      
      if (now - lastUsed < command.cooldown * 1000) {
        const remainingTime = Math.ceil((command.cooldown * 1000 - (now - lastUsed)) / 1000);
        await this.sendMessage(message.from, 
          `⏳ *Cooldown*\n\nAguarde ${remainingTime} segundos para usar este comando novamente.`
        );
        return;
      }
      
      this.rateLimits.set(cooldownKey, now);
    }

    // Executar comando
    try {
      const response = await command.handler(message, args);
      await this.sendMessage(message.from, response);
    } catch (error) {
      console.error('❌ Command execution error:', error);
      await this.sendMessage(message.from, 
        '❌ *Erro interno*\n\n' +
        'Ocorreu um erro ao processar o comando. Tente novamente mais tarde.'
      );
    }
  }

  // 💬 PROCESSAR LINGUAGEM NATURAL
  private async processNaturalLanguage(message: WhatsAppMessage): Promise<void> {
    const text = message.body.toLowerCase();
    
    // Saudações
    if (text.match(/^(oi|olá|hello|hi|opa|e aí)/)) {
      await this.sendMessage(message.from,
        '👋 *Olá!* Bem-vindo ao Torre Suprema Bot!\n\n' +
        '🤖 Sou seu assistente inteligente para o sistema Torre Suprema Enterprise.\n\n' +
        '💡 Digite /help para ver todos os comandos disponíveis.\n\n' +
        '🏰 Torre Suprema - Onde a automação encontra a perfeição!'
      );
      return;
    }

    // Status do sistema
    if (text.includes('status') || text.includes('como está')) {
      const statusCommand = this.commands.get('status');
      if (statusCommand) {
        const response = await statusCommand.handler(message, []);
        await this.sendMessage(message.from, response);
      }
      return;
    }

    // Ajuda
    if (text.includes('ajuda') || text.includes('help') || text.includes('comando')) {
      const helpCommand = this.commands.get('help');
      if (helpCommand) {
        const response = await helpCommand.handler(message, []);
        await this.sendMessage(message.from, response);
      }
      return;
    }

    // Resposta padrão para mensagens não reconhecidas
    await this.sendMessage(message.from,
      '🤔 *Não entendi*\n\n' +
      'Desculpe, não consegui entender sua mensagem.\n\n' +
      '💡 Dicas:\n' +
      '• Use /help para ver comandos\n' +
      '• Use /status para ver o sistema\n' +
      '• Use /support para suporte\n\n' +
      '🤖 Estou sempre aprendendo!'
    );
  }

  // 📋 NOTIFICAÇÕES AUTOMÁTICAS
  async notifySystemEvent(event: string, details: any, recipients?: string[]): Promise<void> {
    const contacts = recipients || 
      Array.from(this.contacts.values())
        .filter(contact => contact.permissions.includes('notifications'))
        .map(contact => contact.phone);

    if (contacts.length === 0) return;

    let message = `🏰 *Torre Suprema Alert*\n\n`;
    
    const eventMessages: { [key: string]: string } = {
      'system_down': '🔴 *Sistema Offline*\n\nO sistema Torre Suprema está temporariamente indisponível.',
      'high_memory': '⚠️ *Alto Uso de Memória*\n\nUso de memória acima do limite seguro.',
      'deployment_success': '✅ *Deploy Concluído*\n\nNova versão implantada com sucesso.',
      'task_completed': '✅ *Tarefa Concluída*\n\nUma tarefa foi finalizada pelos agentes.',
      'agent_error': '❌ *Erro no Agente*\n\nUm agente encontrou um problema.'
    };

    message += eventMessages[event] || `📢 *Evento: ${event}*`;
    
    if (details) {
      message += '\n\n📋 *Detalhes:*\n';
      Object.entries(details).forEach(([key, value]) => {
        message += `• ${key}: ${value}\n`;
      });
    }

    message += `\n⏰ ${new Date().toLocaleString('pt-BR')}`;

    // Enviar para todos os contatos relevantes
    for (const phone of contacts) {
      await this.sendMessage(phone, message);
    }
  }

  // 👥 GERENCIAMENTO DE CONTATOS
  private async addOrUpdateContact(phone: string, name: string): Promise<void> {
    let contact = this.contacts.get(phone);
    
    if (!contact) {
      contact = {
        id: 'contact_' + Date.now(),
        phone,
        name,
        isBot: false,
        permissions: ['basic'], // Permissões básicas por padrão
        lastInteraction: new Date(),
        totalMessages: 0
      };
      
      console.log('👤 New contact added:', name, phone);
    }

    contact.lastInteraction = new Date();
    contact.totalMessages++;
    
    this.contacts.set(phone, contact);
  }

  // 🔐 SISTEMA DE PERMISSÕES
  updateContactPermissions(phone: string, permissions: string[]): boolean {
    const contact = this.contacts.get(phone);
    if (!contact) return false;

    contact.permissions = permissions;
    console.log('🔐 Permissions updated for:', phone, permissions);
    return true;
  }

  // 📊 MÉTODOS AUXILIARES
  private parseIncomingMessage(data: any): WhatsAppMessage | null {
    if (!data.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      return null;
    }

    const msgData = data.entry[0].changes[0].value.messages[0];
    
    return {
      id: msgData.id,
      from: msgData.from,
      to: data.entry[0].changes[0].value.metadata.phone_number_id,
      body: msgData.text?.body || msgData.caption || '',
      timestamp: new Date(parseInt(msgData.timestamp) * 1000),
      type: msgData.type || 'text',
      metadata: msgData
    };
  }

  private saveMessage(message: WhatsAppMessage): void {
    if (!this.messageHistory.has(message.from)) {
      this.messageHistory.set(message.from, []);
    }
    
    const history = this.messageHistory.get(message.from)!;
    history.push(message);
    
    // Manter apenas as últimas 100 mensagens por contato
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  private isRateLimited(phone: string): boolean {
    const key = `rate_limit_${phone}`;
    const lastMessage = this.rateLimits.get(key) || 0;
    const now = Date.now();
    
    // Máximo 10 mensagens por minuto
    if (now - lastMessage < 6000) { // 6 segundos entre mensagens
      return true;
    }
    
    this.rateLimits.set(key, now);
    return false;
  }

  private async makeApiRequest(method: string, endpoint: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `${this.config.apiUrl}${endpoint}`;
      const payload = data ? JSON.stringify(data) : undefined;
      
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(url, options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            resolve(parsed);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      
      if (payload) {
        req.write(payload);
      }
      
      req.end();
    });
  }

  // 🎯 API PÚBLICA
  addCommand(command: BotCommand): void {
    this.commands.set(command.command, command);
    console.log(`🎯 Command added: /${command.command}`);
  }

  getContacts(): WhatsAppContact[] {
    return Array.from(this.contacts.values());
  }

  getMessageHistory(phone: string): WhatsAppMessage[] {
    return this.messageHistory.get(phone) || [];
  }

  // 📊 STATUS
  getStatus() {
    return {
      enabled: this.config.enabled,
      phoneNumberId: this.config.phoneNumberId,
      totalContacts: this.contacts.size,
      totalCommands: this.commands.size,
      messagesProcessed: Array.from(this.messageHistory.values()).reduce((sum, history) => sum + history.length, 0)
    };
  }

  // 🧪 TESTE
  async testBot(): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    try {
      // Teste básico de conectividade
      await this.makeApiRequest('GET', `/${this.config.businessAccountId}`);
      console.log('🧪 WhatsApp Bot test: PASSED');
      return true;
    } catch (error) {
      console.error('🧪 WhatsApp Bot test failed:', error);
      return false;
    }
  }
}

export const whatsAppBot = new TorreSupremaWhatsAppBot();