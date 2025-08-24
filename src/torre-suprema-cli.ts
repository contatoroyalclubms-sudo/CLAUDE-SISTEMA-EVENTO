#!/usr/bin/env node
/**
 * 🏰 TORRE SUPREMA CLI
 * Interface de linha de comando para gerenciar a agência de agentes
 */

import { torreSuprema } from './core/simple-orchestrator';

class TorreSupremaCLI {
  private running: boolean = false;

  async start() {
    this.running = true;
    
    console.log(`
🏰 ===============================================
   TORRE SUPREMA - AGÊNCIA DE AGENTES SUPREMA
   ===============================================
    
🤖 Agentes Disponíveis:
   - Arquiteto Master (architecture)
   - Ultra Backend Performance (backend-performance)
   - General Purpose Agent (general)

📋 Comandos:
   - task <tipo> <descrição>  : Criar nova tarefa
   - status                   : Ver status dos agentes
   - tasks                    : Listar todas as tarefas
   - stats                    : Ver estatísticas
   - help                     : Mostrar ajuda
   - exit                     : Sair

🚀 Sistema ativo e pronto para receber comandos!
`);

    await this.showStatus();
    this.startInteractiveMode();
  }

  private startInteractiveMode() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '🏰 Torre Suprema > '
    });

    rl.prompt();

    rl.on('line', async (input: string) => {
      const trimmed = input.trim();
      
      if (trimmed === 'exit') {
        console.log('👋 Torre Suprema desativada. Até logo!');
        rl.close();
        process.exit(0);
      }

      await this.processCommand(trimmed);
      rl.prompt();
    });

    rl.on('close', () => {
      console.log('👋 Torre Suprema desativada.');
      process.exit(0);
    });
  }

  private async processCommand(input: string) {
    const parts = input.split(' ');
    const command = parts[0].toLowerCase();

    switch (command) {
      case 'task':
        await this.handleTaskCommand(parts.slice(1));
        break;
      case 'status':
        await this.showStatus();
        break;
      case 'tasks':
        await this.showTasks();
        break;
      case 'stats':
        await this.showStats();
        break;
      case 'help':
        this.showHelp();
        break;
      case '':
        break;
      default:
        console.log(`❌ Comando desconhecido: ${command}. Digite 'help' para ver comandos disponíveis.`);
    }
  }

  private async handleTaskCommand(args: string[]) {
    if (args.length < 2) {
      console.log(`❌ Uso: task <tipo> <descrição>
Tipos: architecture, backend-performance, general, frontend, design`);
      return;
    }

    const type = args[0] as any;
    const description = args.slice(1).join(' ');

    const validTypes = ['architecture', 'backend-performance', 'general', 'frontend', 'design'];
    if (!validTypes.includes(type)) {
      console.log(`❌ Tipo inválido. Tipos válidos: ${validTypes.join(', ')}`);
      return;
    }

    try {
      const taskId = await torreSuprema.submitTask({
        type,
        priority: 'medium',
        description,
        payload: { userInput: description }
      });

      console.log(`✅ Tarefa criada: ${taskId}`);
      
      // Aguardar um pouco para mostrar o resultado
      setTimeout(() => {
        const task = torreSuprema.getTaskById(taskId);
        if (task && task.status === 'completed') {
          console.log(`🎉 Tarefa concluída! Resultado:`);
          console.log(task.result);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro ao criar tarefa:', error);
    }
  }

  private async showStatus() {
    const agents = torreSuprema.getAgents();
    
    console.log('\\n🤖 STATUS DOS AGENTES:');
    console.log('========================');
    
    agents.forEach(agent => {
      const statusIcon = agent.status === 'idle' ? '🟢' : 
                        agent.status === 'busy' ? '🟡' : '🔴';
      
      console.log(`${statusIcon} ${agent.name}`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   Status: ${agent.status}`);
      console.log(`   Tarefas: ${agent.performance.tasksCompleted}`);
      console.log(`   Taxa Sucesso: ${(agent.performance.successRate * 100).toFixed(1)}%`);
      if (agent.currentTask) {
        console.log(`   Tarefa Atual: ${agent.currentTask}`);
      }
      console.log('');
    });
  }

  private async showTasks() {
    const tasks = torreSuprema.getTasks();
    
    console.log('\\n📋 HISTÓRICO DE TAREFAS:');
    console.log('=========================');
    
    if (tasks.length === 0) {
      console.log('📭 Nenhuma tarefa executada ainda.');
      return;
    }

    const recent = tasks.slice(-10); // Últimas 10 tarefas
    
    recent.forEach(task => {
      const statusIcon = task.status === 'completed' ? '✅' : 
                        task.status === 'in_progress' ? '⏳' : 
                        task.status === 'failed' ? '❌' : '⏸️';
      
      console.log(`${statusIcon} ${task.id}`);
      console.log(`   Tipo: ${task.type}`);
      console.log(`   Descrição: ${task.description}`);
      console.log(`   Status: ${task.status}`);
      console.log(`   Criada: ${task.createdAt.toLocaleString()}`);
      if (task.assignedAgent) {
        const agent = torreSuprema.getAgentById(task.assignedAgent);
        console.log(`   Agente: ${agent?.name || 'Desconhecido'}`);
      }
      console.log('');
    });
  }

  private async showStats() {
    const stats = torreSuprema.getStats();
    
    console.log('\\n📊 ESTATÍSTICAS DA TORRE SUPREMA:');
    console.log('===================================');
    console.log(`📋 Total de Tarefas: ${stats.totalTasks}`);
    console.log(`✅ Tarefas Concluídas: ${stats.completedTasks}`);
    console.log(`📈 Taxa de Sucesso: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`🤖 Agentes Ativos: ${stats.activeAgents}`);
    console.log(`⏰ Última Atualização: ${new Date(stats.timestamp).toLocaleString()}`);
  }

  private showHelp() {
    console.log(`
🏰 TORRE SUPREMA - COMANDOS DISPONÍVEIS:
========================================

📋 GESTÃO DE TAREFAS:
   task architecture <descrição>      - Criar tarefa de arquitetura
   task backend-performance <desc>     - Criar tarefa de performance
   task general <descrição>            - Criar tarefa geral
   task frontend <descrição>           - Criar tarefa de frontend
   task design <descrição>             - Criar tarefa de design

📊 MONITORAMENTO:
   status                              - Ver status dos agentes
   tasks                               - Listar últimas tarefas
   stats                               - Ver estatísticas gerais

💡 EXEMPLOS:
   task architecture "Projetar API REST para e-commerce"
   task backend-performance "Otimizar consulta PostgreSQL lenta"
   task general "Pesquisar melhores práticas React 2024"

❓ AJUDA:
   help                                - Mostrar esta ajuda
   exit                                - Sair da Torre Suprema
`);
  }
}

// Iniciar CLI se executado diretamente
if (require.main === module) {
  const cli = new TorreSupremaCLI();
  cli.start().catch(console.error);
}

export { TorreSupremaCLI };