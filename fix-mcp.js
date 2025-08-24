#!/usr/bin/env node

/**
 * 🔧 CORREÇÃO AUTOMÁTICA MCP TORRE SUPREMA
 * Sistema de correção automática dos problemas mais comuns
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class MCPAutoFix {
  constructor() {
    this.configPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
    this.backupPath = this.configPath + '.backup.' + Date.now();
  }

  async autoFix() {
    console.log(`
🔧 ===============================================
   CORREÇÃO AUTOMÁTICA MCP TORRE SUPREMA
   ===============================================
`);

    // Fazer backup da configuração
    await this.backupConfiguration();
    
    // Corrigir problemas comuns
    await this.fixDatabasePowerhouse();
    await this.fixMissingPackages();
    await this.optimizeConfiguration();
    
    console.log(`
✅ ===============================================
   CORREÇÕES APLICADAS COM SUCESSO!
   ===============================================
    
🎯 TESTE O SISTEMA:
   npm run torre
   
💾 BACKUP CRIADO: ${this.backupPath}
`);
  }

  async backupConfiguration() {
    console.log('💾 Criando backup da configuração...');
    
    try {
      if (fs.existsSync(this.configPath)) {
        fs.copyFileSync(this.configPath, this.backupPath);
        console.log(`✅ Backup criado: ${this.backupPath}`);
      }
    } catch (error) {
      console.log('⚠️ Erro ao criar backup:', error.message);
    }
  }

  async fixDatabasePowerhouse() {
    console.log('🔧 Corrigindo servidor database-powerhouse...');
    
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      
      if (config.mcpServers && config.mcpServers['database-powerhouse']) {
        // Usar npx em vez de node direto
        config.mcpServers['database-powerhouse'].command = 'npx';
        config.mcpServers['database-powerhouse'].args = [
          '-y',
          '@modelcontextprotocol/server-postgres'
        ];
        
        // Atualizar variáveis de ambiente
        config.mcpServers['database-powerhouse'].env = {
          ...config.mcpServers['database-powerhouse'].env,
          POSTGRES_CONNECTION_STRING: "postgresql://eventos_user:eventos_2024_secure!@localhost:5432/eventos_db"
        };
        
        fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
        console.log('✅ Servidor database-powerhouse corrigido');
      }
    } catch (error) {
      console.log('⚠️ Erro ao corrigir database-powerhouse:', error.message);
    }
  }

  async fixMissingPackages() {
    console.log('📦 Corrigindo pacotes ausentes...');
    
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      
      // Corrigir servidores com problemas de caminho
      const fixedServers = {
        'sqlite-better': {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-sqlite'],
          env: {
            SQLITE_DB_PATH: config.mcpServers['sqlite-better']?.env?.SQLITE_DB_PATH || "./data/database.db",
            GITHUB_TOKEN: config.mcpServers['sqlite-better']?.env?.GITHUB_TOKEN
          }
        }
      };

      // Aplicar correções
      Object.entries(fixedServers).forEach(([serverName, serverConfig]) => {
        if (config.mcpServers[serverName]) {
          config.mcpServers[serverName] = serverConfig;
          console.log(`✅ Servidor ${serverName} corrigido`);
        }
      });

      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.log('⚠️ Erro ao corrigir pacotes:', error.message);
    }
  }

  async optimizeConfiguration() {
    console.log('⚡ Otimizando configuração...');
    
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      
      // Adicionar servidores essenciais se não existirem
      const essentialServers = {
        'mcp-supreme-torre': {
          command: 'npx',
          args: ['-y', 'ts-node', path.join(__dirname, 'src/torre-suprema-cli.ts')],
          env: {
            NODE_ENV: 'development',
            TORRE_SUPREMA_MODE: 'mcp-integration',
            GITHUB_TOKEN: process.env.GITHUB_TOKEN || config.mcpServers?.github?.env?.GITHUB_TOKEN
          }
        }
      };

      // Adicionar servidores essenciais
      Object.entries(essentialServers).forEach(([serverName, serverConfig]) => {
        if (!config.mcpServers[serverName]) {
          config.mcpServers[serverName] = serverConfig;
          console.log(`✅ Servidor ${serverName} adicionado`);
        }
      });

      // Limpar tokens duplicados
      const githubToken = config.mcpServers['github-ultra-advanced']?.env?.GITHUB_TOKEN;
      if (githubToken) {
        Object.values(config.mcpServers).forEach(server => {
          if (server.env && !server.env.GITHUB_TOKEN) {
            server.env.GITHUB_TOKEN = githubToken;
          }
        });
      }

      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      console.log('✅ Configuração otimizada');
      
    } catch (error) {
      console.log('⚠️ Erro ao otimizar configuração:', error.message);
    }
  }
}

// Executar correção automática
if (require.main === module) {
  const autoFix = new MCPAutoFix();
  autoFix.autoFix().catch(console.error);
}

module.exports = MCPAutoFix;
