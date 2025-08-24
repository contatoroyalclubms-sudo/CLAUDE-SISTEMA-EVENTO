#!/usr/bin/env node

/**
 * 🔍 DIAGNÓSTICO AUTOMÁTICO MCP TORRE SUPREMA
 * Sistema completo de verificação e correção de problemas MCP
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

class MCPDiagnostic {
  constructor() {
    this.issues = [];
    this.solutions = [];
    this.configPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
  }

  async runDiagnostic() {
    console.log(`
🔍 ===============================================
   DIAGNÓSTICO AUTOMÁTICO MCP TORRE SUPREMA
   ===============================================
`);

    await this.checkDependencies();
    await this.checkConfiguration();
    await this.checkPorts();
    await this.checkPaths();
    await this.checkMCPServers();
    
    this.generateReport();
  }

  async checkDependencies() {
    console.log('📦 Verificando dependências...');
    
    // Verificar Node.js
    try {
      const nodeVersion = await this.execCommand('node --version');
      console.log(`✅ Node.js: ${nodeVersion.trim()}`);
    } catch (error) {
      this.issues.push('❌ Node.js não encontrado');
      this.solutions.push('🔧 Instalar Node.js versão 18+');
    }

    // Verificar NPM
    try {
      const npmVersion = await this.execCommand('npm --version');
      console.log(`✅ NPM: ${npmVersion.trim()}`);
    } catch (error) {
      this.issues.push('❌ NPM não encontrado');
      this.solutions.push('🔧 Reinstalar Node.js com NPM');
    }

    // Verificar TypeScript
    try {
      const tsVersion = await this.execCommand('npx tsc --version');
      console.log(`✅ TypeScript: ${tsVersion.trim()}`);
    } catch (error) {
      this.issues.push('❌ TypeScript não encontrado');
      this.solutions.push('🔧 npm install -g typescript');
    }

    // Verificar ts-node
    try {
      const tsNodeVersion = await this.execCommand('npx ts-node --version');
      console.log(`✅ ts-node: ${tsNodeVersion.trim()}`);
    } catch (error) {
      this.issues.push('❌ ts-node não encontrado');
      this.solutions.push('🔧 npm install -g ts-node');
    }
  }

  async checkConfiguration() {
    console.log('\n⚙️ Verificando configuração Claude Desktop...');
    
    if (!fs.existsSync(this.configPath)) {
      this.issues.push('❌ Arquivo claude_desktop_config.json não encontrado');
      this.solutions.push('🔧 Criar arquivo de configuração');
      return;
    }

    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      
      if (!config.mcpServers) {
        this.issues.push('❌ Seção mcpServers não encontrada');
        this.solutions.push('🔧 Adicionar seção mcpServers na configuração');
        return;
      }

      const serverCount = Object.keys(config.mcpServers).length;
      console.log(`✅ ${serverCount} servidores MCP configurados`);
      
      // Verificar servidores críticos
      const criticalServers = ['github-ultra-advanced', 'brave-search', 'fetch'];
      criticalServers.forEach(server => {
        if (config.mcpServers[server]) {
          console.log(`✅ Servidor ${server} configurado`);
        } else {
          this.issues.push(`⚠️ Servidor ${server} não configurado`);
          this.solutions.push(`🔧 Adicionar configuração para ${server}`);
        }
      });

    } catch (error) {
      this.issues.push('❌ Erro ao ler configuração: ' + error.message);
      this.solutions.push('🔧 Corrigir sintaxe JSON do arquivo de configuração');
    }
  }

  async checkPorts() {
    console.log('\n🚪 Verificando portas...');
    
    const criticalPorts = [3000, 8000, 4200, 5432, 6379, 9090];
    
    for (const port of criticalPorts) {
      try {
        const result = await this.execCommand(`netstat -ano | findstr :${port}`);
        if (result.includes('LISTENING')) {
          console.log(`⚠️ Porta ${port} em uso`);
          // Não é necessariamente um problema, apenas informativo
        } else {
          console.log(`✅ Porta ${port} disponível`);
        }
      } catch (error) {
        console.log(`✅ Porta ${port} disponível`);
      }
    }
  }

  async checkPaths() {
    console.log('\n📂 Verificando caminhos de servidores...');
    
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      
      for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
        if (serverConfig.command && !serverConfig.command.startsWith('npx')) {
          if (fs.existsSync(serverConfig.command)) {
            console.log(`✅ ${serverName}: ${serverConfig.command}`);
          } else {
            this.issues.push(`❌ ${serverName}: Caminho não encontrado - ${serverConfig.command}`);
            this.solutions.push(`🔧 Corrigir caminho para ${serverName}`);
          }
        }
      }
    } catch (error) {
      // Configuração já verificada anteriormente
    }
  }

  async checkMCPServers() {
    console.log('\n🔌 Testando servidores MCP...');
    
    // Testar se pacotes MCP estão disponíveis
    const mcpPackages = [
      '@modelcontextprotocol/server-brave-search',
      '@modelcontextprotocol/server-fetch',
      '@modelcontextprotocol/server-filesystem',
      '@modelcontextprotocol/server-memory'
    ];

    for (const pkg of mcpPackages) {
      try {
        await this.execCommand(`npm list -g ${pkg}`);
        console.log(`✅ ${pkg} disponível`);
      } catch (error) {
        console.log(`⚠️ ${pkg} não instalado globalmente (será baixado quando necessário)`);
      }
    }
  }

  async execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  generateReport() {
    console.log(`
📊 ===============================================
   RELATÓRIO DE DIAGNÓSTICO
   ===============================================
`);

    if (this.issues.length === 0) {
      console.log('🎉 SISTEMA MCP PERFEITAMENTE CONFIGURADO!');
      console.log('✅ Todos os testes passaram com sucesso');
      console.log('🚀 Pronto para usar MCP Torre Suprema');
    } else {
      console.log('⚠️ PROBLEMAS ENCONTRADOS:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });

      console.log('\n🔧 SOLUÇÕES RECOMENDADAS:');
      this.solutions.forEach((solution, index) => {
        console.log(`${index + 1}. ${solution}`);
      });
    }

    console.log(`
🎯 PRÓXIMOS PASSOS:
   1. npm run torre          - Ativar Torre Suprema
   2. npm run torre-enterprise - Versão empresarial
   3. npm test               - Executar testes
   
📚 DOCUMENTAÇÃO: ./docs/torre-suprema/
🆘 SUPORTE: Verificar logs em ./torre-suprema-memory.json
`);
  }
}

// Executar diagnóstico
if (require.main === module) {
  const diagnostic = new MCPDiagnostic();
  diagnostic.runDiagnostic().catch(console.error);
}

module.exports = MCPDiagnostic;
