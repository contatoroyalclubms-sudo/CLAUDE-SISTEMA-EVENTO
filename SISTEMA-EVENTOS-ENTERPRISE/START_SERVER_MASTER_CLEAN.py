#!/usr/bin/env python3
"""
SERVIDOR WEB LOCAL - TESTE MASTER ULTRA PERFORMANCE
Servidor limpo sem caracteres especiais
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# UTF-8 config
sys.stdout.reconfigure(encoding='utf-8')

# Configuracoes
PORT = 8888
HOST = "0.0.0.0"  # Aceita conexoes externas tambem
DIRECTORY = Path(__file__).parent

class TestMasterHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()
    
    def do_GET(self):
        if self.path == '/':
            self.path = '/TEST_MASTER_URL.html'
        elif self.path == '/api/test':
            # Endpoint de teste simulado
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"running","rps":87432,"response_time":24.8}')
            return
        return super().do_GET()
    
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

def check_port(port):
    """Verifica se a porta esta disponivel"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    return result != 0

def find_available_port(start_port):
    """Encontra uma porta disponivel"""
    for port in range(start_port, start_port + 10):
        if check_port(port):
            return port
    return None

def start_server():
    """Iniciar servidor web"""
    print("\n" + "="*70)
    print("   [MASTER] TESTE MASTER ULTRA PERFORMANCE - SERVIDOR WEB")
    print("="*70)
    
    # Verificar porta
    port = PORT
    if not check_port(port):
        print(f"\n[!] Porta {port} em uso, procurando alternativa...")
        port = find_available_port(PORT + 1)
        if not port:
            print("[X] Nenhuma porta disponivel encontrada!")
            return
    
    print(f"\n[OK] Iniciando servidor na porta {port}...")
    
    try:
        # Criar servidor com reuso de endereco
        socketserver.TCPServer.allow_reuse_address = True
        
        with socketserver.TCPServer((HOST, port), TestMasterHandler) as httpd:
            local_url = f"http://localhost:{port}/TEST_MASTER_URL.html"
            network_url = f"http://{HOST}:{port}/TEST_MASTER_URL.html"
            
            print(f"\n[OK] Servidor rodando!")
            print("\n" + "="*70)
            print("   URLS DISPONIVEIS:")
            print("="*70)
            print(f"   LOCAL:    {local_url}")
            print(f"   NETWORK:  {network_url}")
            print("\n" + "="*70)
            print("   PAGINAS DISPONIVEIS:")
            print("="*70)
            print(f"   * Teste Master:    http://localhost:{port}/TEST_MASTER_URL.html")
            print(f"   * Dashboard:       http://localhost:{port}/DASHBOARD_MONITORAMENTO.html")
            print(f"   * Relatorio MD:    http://localhost:{port}/RELATORIO_PERFORMANCE_ULTRA.md")
            print(f"   * Resultados TXT:  http://localhost:{port}/TEST_RESULTS_MASTER.txt")
            print(f"   * API Test:        http://localhost:{port}/api/test")
            print("\n" + "="*70)
            print("\n[!] Pressione Ctrl+C para parar o servidor\n")
            
            # Abrir navegador
            print("[>] Abrindo navegador...")
            try:
                webbrowser.open(local_url)
                print("[OK] Navegador aberto com sucesso!")
            except:
                print("[!] Nao foi possivel abrir o navegador automaticamente")
                print(f"[!] Acesse manualmente: {local_url}")
            
            print("\n[LOG] Servidor aguardando requisicoes...\n")
            
            # Servir
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n[!] Servidor interrompido pelo usuario")
    except PermissionError:
        print(f"\n[X] Sem permissao para usar porta {port}")
        print("[!] Tente rodar como administrador ou use outra porta")
    except OSError as e:
        if e.errno == 48 or e.errno == 10048:
            print(f"\n[X] Porta {port} ja esta em uso!")
            print("[!] Feche o programa usando essa porta ou escolha outra")
        else:
            print(f"\n[X] Erro do sistema: {e}")
    except Exception as e:
        print(f"\n[X] Erro inesperado: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("\n[OK] Servidor encerrado!")
        print("="*70)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Servidor Web Teste Master")
    parser.add_argument("-p", "--port", type=int, default=8888, help="Porta do servidor")
    parser.add_argument("-H", "--host", default="0.0.0.0", help="Host do servidor")
    
    args = parser.parse_args()
    
    PORT = args.port
    HOST = args.host
    
    print("\n" + "="*70)
    print("   SISTEMA DE EVENTOS - TESTE MASTER ULTRA PERFORMANCE")
    print("="*70)
    print(f"\nConfiguracoes:")
    print(f"  Host: {HOST}")
    print(f"  Porta: {PORT}")
    print(f"  Diretorio: {DIRECTORY}")
    
    start_server()