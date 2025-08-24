// Script para analisar projeto integrado
const { spawn } = require('child_process');

console.log('🔍 ANÁLISE COMPLETA DO PROJETO NOVOSISTEMA\n');
console.log('=' .repeat(50));

const commands = [
  {
    name: '📊 Análise de Arquitetura',
    cmd: 'task architecture "Analisar arquitetura completa do NovoSistema e identificar melhorias"'
  },
  {
    name: '⚡ Análise de Performance',
    cmd: 'task backend-performance "Analisar performance do backend e identificar gargalos"'
  },
  {
    name: '🔒 Análise de Segurança',
    cmd: 'security:status'
  },
  {
    name: '📈 Métricas do Sistema',
    cmd: 'obs:metrics'
  }
];

let currentIndex = 0;

const torre = spawn('npm', ['run', 'suprema'], {
  cwd: 'C:\Users\User\OneDrive\Desktop\MCP-PROGRAMADOR\MCP01PROG\claude-ia',
  shell: true
});

setTimeout(() => {
  console.log('Iniciando análise...');
  torre.stdin.write('enterprise:status\n');
}, 5000);

torre.stdout.on('data', (data) => {
  console.log(data.toString());
});
