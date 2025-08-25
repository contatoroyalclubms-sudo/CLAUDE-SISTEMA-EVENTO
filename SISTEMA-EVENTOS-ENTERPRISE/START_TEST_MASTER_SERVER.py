#!/usr/bin/env python3
"""
🏆 SERVIDOR WEB PARA TESTE MASTER ULTRA PERFORMANCE
Disponibiliza o dashboard de testes via HTTP
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

# Configurações
PORT = 8888
HOST = "localhost"

# Diretório atual
DIRECTORY = Path(__file__).parent

class TestMasterHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()
    
    def do_GET(self):
        # Redirect root to test master page
        if self.path == '/':
            self.path = '/TEST_MASTER_URL.html'
        return super().do_GET()
    
    def log_message(self, format, *args):
        # Custom log format
        print(f"[{self.log_date_time_string()}] {format % args}")

def start_server():
    """Iniciar servidor web"""
    print("\n" + "="*70)
    print("   🏆 TESTE MASTER ULTRA PERFORMANCE - SERVIDOR WEB")
    print("="*70)
    print(f"\n✅ Iniciando servidor na porta {PORT}...")
    
    try:
        with socketserver.TCPServer((HOST, PORT), TestMasterHandler) as httpd:
            url = f"http://{HOST}:{PORT}/TEST_MASTER_URL.html"
            
            print(f"\n🌐 Servidor rodando em: http://{HOST}:{PORT}")
            print(f"\n📊 Dashboard de Teste Master disponível em:")
            print(f"   {url}")
            print("\n" + "="*70)
            print("   URLs DISPONÍVEIS:")
            print("="*70)
            print(f"   • Teste Master: {url}")
            print(f"   • Dashboard Monitor: http://{HOST}:{PORT}/DASHBOARD_MONITORAMENTO.html")
            print(f"   • Relatório: http://{HOST}:{PORT}/RELATORIO_PERFORMANCE_ULTRA.md")
            print(f"   • Resultados: http://{HOST}:{PORT}/TEST_RESULTS_MASTER.txt")
            print("\n" + "="*70)
            print("\n⚡ Pressione Ctrl+C para parar o servidor\n")
            
            # Abrir navegador automaticamente
            print("🌐 Abrindo navegador...")
            webbrowser.open(url)
            
            # Servir indefinidamente
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n⚠️ Servidor interrompido pelo usuário")
    except OSError as e:
        if e.errno == 48 or e.errno == 10048:  # Address already in use
            print(f"\n❌ Porta {PORT} já está em uso!")
            print(f"💡 Tentando porta alternativa...")
            
            # Try alternative port
            alt_port = PORT + 1
            print(f"\n✅ Usando porta {alt_port}...")
            
            with socketserver.TCPServer((HOST, alt_port), TestMasterHandler) as httpd:
                url = f"http://{HOST}:{alt_port}/TEST_MASTER_URL.html"
                print(f"\n🌐 Servidor rodando em: http://{HOST}:{alt_port}")
                print(f"📊 Dashboard disponível em: {url}\n")
                
                webbrowser.open(url)
                httpd.serve_forever()
        else:
            print(f"\n❌ Erro ao iniciar servidor: {e}")
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
    finally:
        print("\n✅ Servidor encerrado com sucesso!")

if __name__ == "__main__":
    start_server()