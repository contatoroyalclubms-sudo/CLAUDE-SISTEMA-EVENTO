/**
 * 🧪 TESTE SEGURO DE INTEGRAÇÃO DE PROJETOS
 * Script simples para testar integração sem loops
 */

const fs = require('fs');
const path = require('path');

console.log('🏰 Torre Suprema - Teste de Integração de Projetos');
console.log('=================================================');

// Função para detectar tipo de projeto
function detectProjectType(projectPath) {
    console.log(`🔍 Analisando: ${projectPath}`);
    
    if (!fs.existsSync(projectPath)) {
        console.log('❌ Pasta não encontrada!');
        return null;
    }
    
    const files = fs.readdirSync(projectPath);
    console.log(`📁 Arquivos encontrados: ${files.length}`);
    
    // Detectar tipo
    let projectType = 'generic';
    let technologies = [];
    let commands = {};
    
    if (files.includes('package.json')) {
        console.log('📦 package.json encontrado - Projeto Node.js');
        projectType = 'nodejs';
        technologies.push('Node.js');
        
        try {
            const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
            console.log(`📋 Nome do projeto: ${packageJson.name}`);
            
            // Detectar React
            if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
                projectType = 'react';
                technologies.push('React');
                console.log('⚛️ React detectado!');
            }
            
            // Detectar TypeScript
            if (packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript) {
                technologies.push('TypeScript');
                console.log('📘 TypeScript detectado!');
            }
            
            // Comandos disponíveis
            if (packageJson.scripts) {
                console.log('📜 Scripts disponíveis:');
                Object.keys(packageJson.scripts).forEach(script => {
                    console.log(`   - ${script}: ${packageJson.scripts[script]}`);
                    commands[script] = `npm run ${script}`;
                });
            }
            
        } catch (error) {
            console.log('⚠️ Erro ao ler package.json:', error.message);
        }
    }
    
    // Detectar outros tipos
    if (files.includes('requirements.txt') || files.includes('setup.py')) {
        projectType = 'python';
        technologies.push('Python');
        console.log('🐍 Projeto Python detectado!');
    }
    
    if (files.some(file => file.endsWith('.csproj'))) {
        projectType = 'dotnet';
        technologies.push('C#', '.NET');
        console.log('🔷 Projeto .NET detectado!');
    }
    
    return {
        type: projectType,
        technologies,
        commands,
        fileCount: files.length
    };
}

// Função para sugerir agentes
function suggestAgents(projectInfo) {
    console.log('\n🤖 AGENTES RECOMENDADOS:');
    
    const agentSuggestions = [];
    
    switch (projectInfo.type) {
        case 'react':
            agentSuggestions.push('🎨 Frontend Dev Agent - Para otimizar componentes React');
            agentSuggestions.push('🏛️ Architect Master - Para revisar arquitetura do frontend');
            break;
            
        case 'nodejs':
            agentSuggestions.push('⚡ Ultra Backend Performance - Para otimizar APIs');
            agentSuggestions.push('🏛️ Architect Master - Para arquitetura de microservices');
            break;
            
        case 'python':
            agentSuggestions.push('📊 Data Analyst Agent - Para análise de dados');
            agentSuggestions.push('⚡ Ultra Backend Performance - Para APIs Python');
            break;
            
        default:
            agentSuggestions.push('🎯 General Purpose Agent - Para análise geral');
            agentSuggestions.push('🏛️ Architect Master - Para revisão arquitetural');
    }
    
    agentSuggestions.forEach(suggestion => {
        console.log(`   ${suggestion}`);
    });
    
    return agentSuggestions;
}

// Função para sugerir tarefas
function suggestTasks(projectInfo) {
    console.log('\n📋 TAREFAS SUGERIDAS:');
    
    const tasks = [
        '🔍 Analisar estrutura do projeto e identificar melhorias',
        '⚡ Otimizar performance e identificar gargalos',
        '🔒 Revisar segurança e boas práticas',
        '📚 Gerar documentação automática',
        '🧪 Criar testes automatizados',
        '🚀 Configurar pipeline de CI/CD'
    ];
    
    tasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task}`);
    });
    
    return tasks;
}

// TESTE PRINCIPAL
function testProjectIntegration() {
    console.log('\n🧪 INICIANDO TESTE DE INTEGRAÇÃO...\n');
    
    // Caminhos para testar
    const testPaths = [
        "C:\\Users\\User\\OneDrive\\Desktop\\projetos github\\NovoSistema\\paineluniversal",
        "C:\\Users\\User\\OneDrive\\Desktop\\projetos github\\NovoSistema",
        "C:\\Users\\User\\OneDrive\\Desktop\\projetos github",
        // Adicione outros caminhos se necessário
    ];
    
    let foundProject = null;
    
    for (const testPath of testPaths) {
        console.log(`\n🔍 Testando caminho: ${testPath}`);
        const projectInfo = detectProjectType(testPath);
        
        if (projectInfo) {
            foundProject = { path: testPath, info: projectInfo };
            break;
        }
    }
    
    if (foundProject) {
        console.log('\n✅ PROJETO ENCONTRADO E ANALISADO!');
        console.log('==================================');
        console.log(`📁 Caminho: ${foundProject.path}`);
        console.log(`📦 Tipo: ${foundProject.info.type}`);
        console.log(`🔧 Tecnologias: ${foundProject.info.technologies.join(', ')}`);
        console.log(`📊 Total de arquivos: ${foundProject.info.fileCount}`);
        
        // Sugestões
        suggestAgents(foundProject.info);
        suggestTasks(foundProject.info);
        
        console.log('\n🚀 COMANDOS PARA USAR NO TORRE SUPREMA:');
        console.log('=====================================');
        console.log(`project:integrate "${foundProject.path}"`);
        console.log('project:list');
        console.log('project:execute <project-id> architecture "Analisar arquitetura do projeto"');
        console.log('project:execute <project-id> backend-performance "Otimizar performance"');
        
    } else {
        console.log('\n❌ NENHUM PROJETO ENCONTRADO');
        console.log('Verifique se o caminho está correto:');
        testPaths.forEach(p => console.log(`   - ${p}`));
    }
}

// Executar teste
try {
    testProjectIntegration();
} catch (error) {
    console.error('❌ Erro no teste:', error.message);
}

console.log('\n✅ Teste concluído sem loops! 🎉');