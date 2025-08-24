// Script para integrar projeto NovoSistema
const readline = require('readline');
const { spawn } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🏰 Integrando projeto NovoSistema ao Torre Suprema...\n');

// Iniciar Torre Suprema CLI
const torre = spawn('npm', ['run', 'suprema'], {
  cwd: 'C:\\Users\\User\\OneDrive\\Desktop\\MCP-PROGRAMADOR\\MCP01PROG\\claude-ia',
  shell: true
});

// Aguardar inicialização
setTimeout(() => {
  console.log('📂 Enviando comando de integração...\n');
  
  // Comando de integração
  const integrationCommand = 'project:integrate "C:\\Users\\User\\OneDrive\\Desktop\\projetos github\\NovoSistema\\paineluniversal"\n';
  
  torre.stdin.write(integrationCommand);
  
  // Aguardar resposta
  setTimeout(() => {
    console.log('\n✅ Comando enviado! Verificando status...\n');
    
    // Verificar projetos integrados
    torre.stdin.write('project:list\n');
    
    setTimeout(() => {
      console.log('\n📊 Gerando relatório de integração...\n');
      torre.stdin.write('project:report\n');
      
      setTimeout(() => {
        console.log('\n🎯 Integração concluída!');
        torre.stdin.write('exit\n');
        process.exit(0);
      }, 3000);
    }, 3000);
  }, 3000);
}, 5000);

// Capturar saída
torre.stdout.on('data', (data) => {
  console.log(data.toString());
});

torre.stderr.on('data', (data) => {
  console.error(`Erro: ${data}`);
});