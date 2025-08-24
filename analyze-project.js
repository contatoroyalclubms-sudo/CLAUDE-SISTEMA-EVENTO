/**
 * 🔍 ANÁLISE DIRETA DO PROJETO
 * Script para analisar o projeto sem precisar do CLI
 */

const fs = require('fs');
const path = require('path');

const projectPath = "C:\\Users\\User\\OneDrive\\Desktop\\projetos github\\NovoSistema";

console.log('🏰 TORRE SUPREMA - ANÁLISE ARQUITETURAL DO PROJETO');
console.log('==================================================');

// Função para analisar estrutura detalhada
function analyzeProjectStructure(basePath) {
    console.log(`🔍 Analisando estrutura de: ${basePath}\n`);
    
    const analysis = {
        directories: [],
        fileTypes: {},
        totalFiles: 0,
        technologies: new Set(),
        configFiles: [],
        sourceFiles: [],
        recommendations: []
    };
    
    function scanDirectory(dirPath, level = 0, maxLevel = 3) {
        if (level > maxLevel) return;
        
        try {
            const items = fs.readdirSync(dirPath);
            const indent = '  '.repeat(level);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    if (!item.startsWith('.') && !item.includes('node_modules')) {
                        console.log(`${indent}📁 ${item}/`);
                        analysis.directories.push({
                            name: item,
                            path: fullPath,
                            level: level
                        });
                        scanDirectory(fullPath, level + 1, maxLevel);
                    }
                } else {
                    analysis.totalFiles++;
                    const ext = path.extname(item).toLowerCase();
                    analysis.fileTypes[ext] = (analysis.fileTypes[ext] || 0) + 1;
                    
                    // Detectar tecnologias por extensão
                    switch (ext) {
                        case '.js':
                        case '.jsx':
                            analysis.technologies.add('JavaScript');
                            if (ext === '.jsx') analysis.technologies.add('React');
                            break;
                        case '.ts':
                        case '.tsx':
                            analysis.technologies.add('TypeScript');
                            if (ext === '.tsx') analysis.technologies.add('React');
                            break;
                        case '.py':
                            analysis.technologies.add('Python');
                            break;
                        case '.cs':
                            analysis.technologies.add('C#');
                            break;
                        case '.java':
                            analysis.technologies.add('Java');
                            break;
                        case '.php':
                            analysis.technologies.add('PHP');
                            break;
                        case '.go':
                            analysis.technologies.add('Go');
                            break;
                        case '.rs':
                            analysis.technologies.add('Rust');
                            break;
                        case '.vue':
                            analysis.technologies.add('Vue.js');
                            break;
                    }
                    
                    // Arquivos de configuração importantes
                    if (['package.json', 'requirements.txt', 'composer.json', 'pom.xml', 
                         'Dockerfile', 'docker-compose.yml', '.gitignore', 'README.md',
                         'tsconfig.json', 'webpack.config.js', 'vite.config.js'].includes(item)) {
                        analysis.configFiles.push({
                            name: item,
                            path: fullPath,
                            directory: path.basename(dirPath)
                        });
                        console.log(`${indent}⚙️ ${item}`);
                    } else if (level <= 2) {
                        console.log(`${indent}📄 ${item}`);
                    }
                    
                    // Arquivos fonte importantes
                    if (['index.js', 'index.ts', 'main.js', 'main.ts', 'app.js', 'app.ts',
                         'server.js', 'server.ts', 'index.html', 'App.jsx', 'App.tsx'].includes(item)) {
                        analysis.sourceFiles.push({
                            name: item,
                            path: fullPath,
                            directory: path.basename(dirPath)
                        });
                    }
                }
            }
        } catch (error) {
            console.log(`${indent}❌ Erro ao ler diretório: ${error.message}`);
        }
    }
    
    scanDirectory(basePath);
    return analysis;
}

// Função para gerar recomendações baseada na análise
function generateRecommendations(analysis) {
    console.log('\n🎯 ANÁLISE ARQUITETURAL & RECOMENDAÇÕES');
    console.log('=======================================');
    
    const recommendations = [];
    
    // Análise de estrutura
    console.log('\n📊 ESTATÍSTICAS DO PROJETO:');
    console.log(`   📁 Diretórios: ${analysis.directories.length}`);
    console.log(`   📄 Total de arquivos: ${analysis.totalFiles}`);
    console.log(`   🔧 Tecnologias: ${Array.from(analysis.technologies).join(', ') || 'Não detectadas'}`);
    
    // Tipos de arquivo mais comuns
    console.log('\n📋 TIPOS DE ARQUIVO:');
    const sortedFileTypes = Object.entries(analysis.fileTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    sortedFileTypes.forEach(([ext, count]) => {
        console.log(`   ${ext || '(sem ext)'}: ${count} arquivos`);
    });
    
    // Arquivos de configuração
    if (analysis.configFiles.length > 0) {
        console.log('\n⚙️ ARQUIVOS DE CONFIGURAÇÃO ENCONTRADOS:');
        analysis.configFiles.forEach(file => {
            console.log(`   📄 ${file.name} (em ${file.directory})`);
        });
    }
    
    // Arquivos fonte principais
    if (analysis.sourceFiles.length > 0) {
        console.log('\n🚀 ARQUIVOS FONTE PRINCIPAIS:');
        analysis.sourceFiles.forEach(file => {
            console.log(`   📄 ${file.name} (em ${file.directory})`);
        });
    }
    
    // Recomendações baseadas na análise
    console.log('\n💡 RECOMENDAÇÕES ARQUITETURAIS:');
    
    if (analysis.totalFiles > 200) {
        console.log('   🏗️ PROJETO GRANDE: Considere modularização e microservices');
        recommendations.push('Implementar arquitetura modular');
    }
    
    if (analysis.technologies.has('JavaScript') || analysis.technologies.has('TypeScript')) {
        console.log('   ⚛️ FRONTEND: Otimizar bundling e performance');
        recommendations.push('Otimizar build e performance do frontend');
    }
    
    if (analysis.technologies.has('Python')) {
        console.log('   🐍 PYTHON: Implementar virtual environments e dockerização');
        recommendations.push('Configurar ambiente Python otimizado');
    }
    
    if (!analysis.configFiles.some(f => f.name === 'Dockerfile')) {
        console.log('   🐳 DOCKER: Adicionar containerização para deploy');
        recommendations.push('Implementar containerização Docker');
    }
    
    if (!analysis.configFiles.some(f => f.name.includes('test'))) {
        console.log('   🧪 TESTES: Implementar suite de testes automatizados');
        recommendations.push('Criar estratégia de testes abrangente');
    }
    
    console.log('   🔒 SEGURANÇA: Implementar verificações de segurança');
    console.log('   📚 DOCUMENTAÇÃO: Gerar documentação automática');
    console.log('   🚀 CI/CD: Configurar pipeline de deploy automático');
    
    return recommendations;
}

// Função para sugerir próximos passos
function suggestNextSteps() {
    console.log('\n🚀 PRÓXIMOS PASSOS SUGERIDOS:');
    console.log('============================');
    
    console.log('1️⃣ ANÁLISE DETALHADA:');
    console.log('   npm run torre-enterprise');
    console.log('   project:integrate "C:\\Users\\User\\OneDrive\\Desktop\\projetos github\\NovoSistema"');
    
    console.log('\n2️⃣ REVISÃO ARQUITETURAL:');
    console.log('   project:execute <project-id> architecture "Revisar arquitetura e sugerir melhorias"');
    
    console.log('\n3️⃣ OTIMIZAÇÃO DE PERFORMANCE:');
    console.log('   project:execute <project-id> backend-performance "Otimizar performance para alta escala"');
    
    console.log('\n4️⃣ ANÁLISE DE SEGURANÇA:');
    console.log('   project:execute <project-id> general "Análise completa de segurança"');
}

// EXECUTAR ANÁLISE
try {
    console.log('🔍 Iniciando análise detalhada...\n');
    const analysis = analyzeProjectStructure(projectPath);
    
    generateRecommendations(analysis);
    suggestNextSteps();
    
    console.log('\n✅ ANÁLISE CONCLUÍDA COM SUCESSO! 🎉');
    console.log('\n🏰 Torre Suprema está pronta para trabalhar no seu projeto!');
    
} catch (error) {
    console.error('❌ Erro na análise:', error.message);
}