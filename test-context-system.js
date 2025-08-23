// 🧪 TESTE COMPLETO DO SISTEMA DE CONTEXTO
// Execute com: node test-context-system.js

const { Pool } = require('pg');

class ContextTester {
  constructor() {
    this.pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'torre_suprema_memory',
      user: 'torre_admin',
      password: 'suprema_power_2024',
    });
    
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧠 TESTANDO SISTEMA DE CONTEXTO DA TORRE SUPREMA');
    console.log('='.repeat(50));
    
    try {
      await this.testDatabaseConnection();
      await this.testContextCreation();
      await this.testConversationSaving();
      await this.testKnowledgeSaving();
      await this.testKnowledgeSearch();
      await this.testAgentPerformance();
      await this.testProjectTracking();
      await this.testAnalytics();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Erro nos testes:', error);
    } finally {
      await this.pool.end();
    }
  }

  async testDatabaseConnection() {
    console.log('\n🔌 Teste 1: Conexão com banco de dados...');
    
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW() as current_time');
      client.release();
      
      this.testResults.push({
        test: 'Database Connection',
        status: '✅ PASSOU',
        details: `Conectado em: ${result.rows[0].current_time}`
      });
      
      console.log('✅ Conexão estabelecida!');
    } catch (error) {
      this.testResults.push({
        test: 'Database Connection',
        status: '❌ FALHOU',
        details: error.message
      });
      
      console.log('❌ Falha na conexão:', error.message);
      throw error;
    }
  }

  async testContextCreation() {
    console.log('\n🆕 Teste 2: Criação de contexto...');
    
    try {
      const sessionId = `test-session-${Date.now()}`;
      
      const result = await this.pool.query(`
        INSERT INTO torre_suprema_context (
          session_id, 
          user_id, 
          current_status, 
          current_task,
          communication_style
        ) VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, session_id
      `, [sessionId, 'test-user', 'testing', 'Executando testes do sistema', 'enthusiastic']);

      const contextId = result.rows[0].id;
      this.contextId = contextId;
      
      this.testResults.push({
        test: 'Context Creation',
        status: '✅ PASSOU',
        details: `Context ID: ${contextId}`
      });
      
      console.log(`✅ Contexto criado: ${contextId}`);
    } catch (error) {
      this.testResults.push({
        test: 'Context Creation',
        status: '❌ FALHOU',
        details: error.message
      });
      
      console.log('❌ Falha na criação:', error.message);
      throw error;
    }
  }

  async testConversationSaving() {
    console.log('\n💬 Teste 3: Salvamento de conversas...');
    
    try {
      const result = await this.pool.query(`
        INSERT INTO conversation_messages (
          context_id,
          message_sequence,
          user_message,
          torre_response,
          message_type,
          intent_detected,
          sentiment,
          actions_taken,
          outcome,
          execution_time
        ) VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        this.contextId,
        'Testando o sistema de contexto',
        'Sistema funcionando perfeitamente! Todos os testes passando.',
        'test',
        'system_test',
        'positive',
        JSON.stringify(['database_test', 'context_creation']),
        'success',
        1250
      ]);

      this.testResults.push({
        test: 'Conversation Saving',
        status: '✅ PASSOU',
        details: `Message ID: ${result.rows[0].id}`
      });
      
      console.log('✅ Conversa salva com sucesso!');
    } catch (error) {
      this.testResults.push({
        test: 'Conversation Saving',
        status: '❌ FALHOU',
        details: error.message
      });
      
      console.log('❌ Falha no salvamento:', error.message);
      throw error;
    }
  }

  async testKnowledgeSaving() {
    console.log('\n🎓 Teste 4: Salvamento de conhecimento...');
    
    try {
      const result = await this.pool.query(`
        INSERT INTO torre_knowledge (
          context_id,
          category,
          domain,
          technology,
          title,
          problem_description,
          solution_description,
          tags,
          confidence_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        this.contextId,
        'test_knowledge',
        'testing',
        'nodejs',
        'Como testar sistema de contexto',
        'Necessário validar que o sistema de contexto funciona corretamente',
        'Criar testes automatizados que verificam conexão, salvamento e busca',
        JSON.stringify(['testing', 'context', 'database', 'nodejs']),
        0.95
      ]);

      this.testResults.push({
        test: 'Knowledge Saving',
        status: '✅ PASSOU',
        details: `Knowledge ID: ${result.rows[0].id}`
      });
      
      console.log('✅ Conhecimento salvo com sucesso!');
    } catch (error) {
      this.testResults.push({
        test: 'Knowledge Saving',
        status: '❌ FALHOU',
        details: error.message
      });
      
      console.log('❌ Falha no salvamento:', error.message);
      throw error;
    }
  }

  async testKnowledgeSearch() {
    console.log('\n🔍 Teste 5: Busca de conhecimento...');
    
    try {
      const result = await this.pool.query(`
        SELECT k.*, 
               ts_rank(k.search_vector, plainto_tsquery('portuguese', $1)) as rank
        FROM torre_knowledge k
        WHERE k.context_id = $2
          AND k.search_vector @@ plainto_tsquery('portuguese', $1)
        ORDER BY rank DESC
        LIMIT 5
      `, ['teste sistema', this.contextId]);

      this.testResults.push({
        test: 'Knowledge Search',
        status: '✅ PASSOU',
        details: `Encontrados ${result.rows.length} resultados`
      });
      
      console.log(`✅ Busca realizada: ${result.rows.length} resultados encontrados`);
    } catch (error) {
      this.testResults.push({
        test: 'Knowledge Search',
        status: '❌ FALHOU',
        details: error.message
      });
      
      console.log('❌ Falha na busca:', error.message);
      throw error;
    }
  }

  async testAgentPerformance() {
    console.log('\n🤖 Teste 6: Tracking de agentes...');
    
    try {
      await this.pool.query(`
        INSERT INTO torre_agents (
          context_id,
          agent_name,
          agent_type,
          skills,
          status,
          tasks_completed,
          success_rate,
          average_completion_time
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        this.contextId,
        'Test Backend Agent',
        'backend',
        JSON.stringify(['nodejs', 'postgresql', 'testing']),
        'active',
        1,
        1.0,
        1250
      ]);

      this.testResults.push({
        test: 'Agent Performance',
        status: '✅ PASSOU',
        details: 'Agente de teste registrado com sucesso'
      });
      
      console.log('✅ Performance do agente registrada!');
    } catch (error) {
      this.testResults.push({
        test: 'Agent Performance',
        status: '❌ FALHOU',
        details: error.message
      });
      
      console.log('❌ Falha no registro:', error.message);
      throw error;
    }
  }

  async testProjectTracking() {
    console.log('\n📁 Teste 7: Tracking de projetos...');
    
    try {
      const result = await this.pool.query(`
        INSERT INTO torre_projects (
          context_id,
          name,
          description,
          project_type,
          tech_stack,
          status,
          completion_percentage
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        this.contextId,
        'Teste Context System',
        'Sistema de teste para validar o contexto da Torre Suprema',
        'testing',
        JSON.stringify(['nodejs', 'postgresql', 'testing']),
        'active',
        75.0
      ]);

      this.testResults.push({
        test: 'Project Tracking',
        status: '✅ PASSOU',
        details: `Project ID: ${result.rows[0].id}`
      });
      
      console.log('✅ Projeto registrado com sucesso!');
    } catch (error) {
      this.testResults.push({
        test: 'Project Tracking',
        status: '❌ FALHOU',
        details: error.message
      });
      
      console.log('❌ Falha no registro:', error.message);
      throw error;
    }
  }

  async testAnalytics() {
    console.log('\n📊 Teste 8: Sistema de analytics...');
    
    try {
      // Testar view de status atual
      const statusResult = await this.pool.query(`
        SELECT * FROM torre_current_status WHERE id = $1
      `, [this.contextId]);

      // Testar estatísticas gerais
      const statsResult = await this.pool.query(`
        SELECT 
          COUNT(DISTINCT cm.id) as total_conversations,
          COUNT(DISTINCT tp.id) as total_projects,
          COUNT(DISTINCT tk.id) as total_knowledge,
          COUNT(DISTINCT ta.id) as total_agents
        FROM torre_suprema_context c
        LEFT JOIN conversation_messages cm ON c.id = cm.context_id
        LEFT JOIN torre_projects tp ON c.id = tp.context_id
        LEFT JOIN torre_knowledge tk ON c.id = tk.context_id
        LEFT JOIN torre_agents ta ON c.id = ta.context_id
        WHERE c.id = $1
        GROUP BY c.id
      `, [this.contextId]);

      this.testResults.push({
        test: 'Analytics System',
        status: '✅ PASSOU',
        details: `Views funcionando. Stats: ${JSON.stringify(statsResult.rows[0])}`
      });
      
      console.log('✅ Sistema de analytics funcionando!');
      console.log(`📊 Estatísticas: ${JSON.stringify(statsResult.rows[0], null, 2)}`);
    } catch (error) {
      this.testResults.push({
        test: 'Analytics System',
        status: '❌ FALHOU',
        details: error.message
      });
      
      console.log('❌ Falha no analytics:', error.message);
      throw error;
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('🏆 RESULTADOS DOS TESTES');
    console.log('='.repeat(50));
    
    let passed = 0;
    let failed = 0;
    
    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.test}: ${result.status}`);
      if (result.details) {
        console.log(`   └─ ${result.details}`);
      }
      
      if (result.status.includes('✅')) {
        passed++;
      } else {
        failed++;
      }
    });
    
    console.log('\n' + '-'.repeat(50));
    console.log(`✅ PASSOU: ${passed} testes`);
    console.log(`❌ FALHOU: ${failed} testes`);
    console.log(`📊 TAXA DE SUCESSO: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!');
      console.log('🧠 SISTEMA DE CONTEXTO ESTÁ FUNCIONANDO PERFEITAMENTE!');
      console.log('🚀 TORRE SUPREMA PRONTA PARA COORDENAR PROJETOS!');
    } else {
      console.log('\n⚠️  ALGUNS TESTES FALHARAM');
      console.log('🔧 VERIFIQUE AS CONFIGURAÇÕES ANTES DE PROSSEGUIR');
    }
  }
}

// Executar testes
async function main() {
  const tester = new ContextTester();
  await tester.runAllTests();
}

// Verificar se está sendo executado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ContextTester;