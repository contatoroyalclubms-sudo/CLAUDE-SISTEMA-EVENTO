#!/usr/bin/env python3
"""
TESTE ULTRA PERFORMANCE SIMPLIFICADO - Sistema de Eventos
"""

import time
import json
import statistics
import concurrent.futures
from datetime import datetime
import requests
from pathlib import Path

class UltraPerformanceTestSimple:
    """Teste de performance simplificado"""
    
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.results = {}
        
    def test_api_response_time(self):
        """Testar tempo de resposta da API"""
        print("\n" + "="*60)
        print("  TESTE DE TEMPO DE RESPOSTA DA API")
        print("="*60 + "\n")
        
        endpoints = [
            ("/health", "Health Check"),
            ("/docs", "Documentation"),
            ("/metrics", "Metrics"),
        ]
        
        for endpoint, name in endpoints:
            url = f"{self.base_url}{endpoint}"
            times = []
            
            print(f"Testando {name} ({endpoint})...")
            
            for i in range(10):
                try:
                    start = time.perf_counter()
                    response = requests.get(url, timeout=5)
                    elapsed = (time.perf_counter() - start) * 1000
                    times.append(elapsed)
                    
                    if i == 0:  # First request
                        status = "OK" if response.status_code < 400 else f"ERROR ({response.status_code})"
                        print(f"  Status: {status}")
                except Exception as e:
                    print(f"  ERRO: {str(e)}")
                    times.append(5000)  # Timeout penalty
            
            if times:
                avg_time = statistics.mean(times)
                min_time = min(times)
                max_time = max(times)
                
                print(f"  Tempo medio: {avg_time:.2f}ms")
                print(f"  Min: {min_time:.2f}ms | Max: {max_time:.2f}ms")
                
                if avg_time < 50:
                    print("  Resultado: EXCELENTE (<50ms)")
                elif avg_time < 100:
                    print("  Resultado: BOM (<100ms)")
                elif avg_time < 500:
                    print("  Resultado: ACEITAVEL (<500ms)")
                else:
                    print("  Resultado: LENTO (>500ms)")
                
                print()
    
    def test_concurrent_requests(self):
        """Testar requisicoes concorrentes"""
        print("\n" + "="*60)
        print("  TESTE DE CARGA CONCORRENTE")
        print("="*60 + "\n")
        
        url = f"{self.base_url}/health"
        
        def make_request():
            try:
                start = time.perf_counter()
                response = requests.get(url, timeout=5)
                elapsed = time.perf_counter() - start
                return {"success": response.status_code < 400, "time": elapsed}
            except:
                return {"success": False, "time": 5.0}
        
        concurrent_levels = [10, 50, 100]
        
        for concurrent in concurrent_levels:
            print(f"Testando com {concurrent} usuarios simultaneos...")
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent) as executor:
                start = time.time()
                futures = [executor.submit(make_request) for _ in range(concurrent)]
                responses = [f.result() for f in concurrent.futures.as_completed(futures)]
                total_time = time.time() - start
            
            successes = sum(1 for r in responses if r["success"])
            avg_time = statistics.mean([r["time"] for r in responses]) * 1000
            rps = concurrent / total_time
            
            print(f"  Taxa de sucesso: {(successes/concurrent)*100:.1f}%")
            print(f"  Tempo medio: {avg_time:.2f}ms")
            print(f"  Requisicoes por segundo: {rps:.2f}")
            
            if rps > 100:
                print("  Resultado: EXCELENTE (>100 RPS)")
            elif rps > 50:
                print("  Resultado: BOM (>50 RPS)")
            else:
                print("  Resultado: PRECISA OTIMIZACAO (<50 RPS)")
            
            print()
    
    def test_stress(self, duration=10):
        """Teste de stress basico"""
        print("\n" + "="*60)
        print(f"  TESTE DE STRESS ({duration} segundos)")
        print("="*60 + "\n")
        
        url = f"{self.base_url}/health"
        start_time = time.time()
        end_time = start_time + duration
        
        total_requests = 0
        successful_requests = 0
        
        print(f"Bombardeando servidor por {duration} segundos...")
        
        while time.time() < end_time:
            try:
                response = requests.get(url, timeout=1)
                total_requests += 1
                if response.status_code < 400:
                    successful_requests += 1
            except:
                total_requests += 1
            
            # Progress update
            if total_requests % 100 == 0:
                elapsed = time.time() - start_time
                rps = total_requests / elapsed
                print(f"  Progresso: {elapsed:.1f}s | RPS: {rps:.0f} | Total: {total_requests}", end="\r")
        
        print()
        
        total_time = time.time() - start_time
        final_rps = total_requests / total_time
        success_rate = (successful_requests / total_requests) * 100 if total_requests > 0 else 0
        
        print(f"\n  Total de requisicoes: {total_requests}")
        print(f"  Requisicoes bem-sucedidas: {successful_requests}")
        print(f"  Taxa de sucesso: {success_rate:.1f}%")
        print(f"  RPS medio: {final_rps:.2f}")
        
        if final_rps > 500:
            print("  Resultado: ULTRA PERFORMANCE (>500 RPS)")
        elif final_rps > 100:
            print("  Resultado: HIGH PERFORMANCE (>100 RPS)")
        else:
            print("  Resultado: PERFORMANCE PADRAO (<100 RPS)")
    
    def generate_report(self):
        """Gerar relatorio final"""
        print("\n" + "="*60)
        print("  RELATORIO FINAL DE PERFORMANCE")
        print("="*60 + "\n")
        
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        report = f"""
RELATORIO DE TESTE ULTRA PERFORMANCE
=====================================
Data: {timestamp}
URL Base: {self.base_url}

RESUMO DOS TESTES:
------------------
1. Tempo de Resposta da API: TESTADO
2. Carga Concorrente: TESTADO
3. Teste de Stress: TESTADO

CONCLUSAO:
----------
Sistema testado com sucesso.
Verifique os resultados acima para detalhes de performance.

RECOMENDACOES:
--------------
- Para melhor performance, otimize queries do banco de dados
- Implemente cache para endpoints frequentes
- Configure connection pooling adequado
- Use CDN para assets estaticos
"""
        
        # Save report
        report_file = Path(f"performance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")
        report_file.write_text(report)
        
        print(f"Relatorio salvo em: {report_file}")
        
        return report
    
    def run_all_tests(self):
        """Executar todos os testes"""
        print("\n" + "="*80)
        print("    INICIANDO TESTE ULTRA PERFORMANCE - SISTEMA DE EVENTOS")
        print("="*80)
        
        # Check server
        print("\nVerificando conectividade com servidor...")
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                print("Servidor ONLINE!")
            else:
                print(f"Servidor retornou status {response.status_code}")
        except Exception as e:
            print(f"ERRO: Nao foi possivel conectar ao servidor em {self.base_url}")
            print(f"Detalhes: {e}")
            print("\nCertifique-se de que o servidor esta rodando:")
            print("  1. Execute: ATIVACAO_SUPREMA.bat")
            print("  2. Ou: python AUTO_DEPLOY_SUPREMO.py")
            return
        
        # Run tests
        self.test_api_response_time()
        self.test_concurrent_requests()
        self.test_stress(duration=5)  # Short stress test
        
        # Generate report
        self.generate_report()
        
        print("\n" + "="*80)
        print("    TESTE ULTRA PERFORMANCE CONCLUIDO!")
        print("="*80)

if __name__ == "__main__":
    tester = UltraPerformanceTestSimple()
    tester.run_all_tests()