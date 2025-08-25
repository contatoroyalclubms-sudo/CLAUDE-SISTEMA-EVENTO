# ============================================
# SISTEMA UNIVERSAL DE EVENTOS v4.0.0
# SUPREME ONE-CLICK DEPLOY - POWERSHELL EDITION
# ============================================

# Requer execução como administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Start-Process PowerShell -Verb RunAs "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

# Configurações
$global:ProjectName = "SISTEMA-EVENTOS-ENTERPRISE"
$global:ProjectPath = "$PSScriptRoot\$ProjectName"
$global:LogFile = "$ProjectPath\install.log"

# Cores para output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Banner inicial
function Show-Banner {
    Clear-Host
    Write-Host @"
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║     ███████╗██╗███████╗████████╗███████╗███╗   ███╗ █████╗             ║
║     ██╔════╝██║██╔════╝╚══██╔══╝██╔════╝████╗ ████║██╔══██╗            ║
║     ███████╗██║███████╗   ██║   █████╗  ██╔████╔██║███████║            ║
║     ╚════██║██║╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║██╔══██║            ║
║     ███████║██║███████║   ██║   ███████╗██║ ╚═╝ ██║██║  ██║            ║
║     ╚══════╝╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝            ║
║                                                                          ║
║              UNIVERSAL DE EVENTOS v4.0.0 - SUPREME EDITION              ║
║                     ONE-CLICK ENTERPRISE DEPLOY                         ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Magenta
}

# Função para log
function Write-Log {
    param($Message, $Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$Timestamp [$Level] $Message" | Out-File -FilePath $LogFile -Append
    
    switch ($Level) {
        "SUCCESS" { Write-Success "✓ $Message" }
        "INFO" { Write-Info "→ $Message" }
        "WARNING" { Write-Warning "⚠ $Message" }
        "ERROR" { Write-Error "✗ $Message" }
    }
}

# Verificar e instalar Chocolatey
function Install-Chocolatey {
    Write-Log "Verificando Chocolatey..." "INFO"
    
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Log "Instalando Chocolatey..." "INFO"
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
        Write-Log "Chocolatey instalado!" "SUCCESS"
    } else {
        Write-Log "Chocolatey já instalado" "SUCCESS"
    }
}

# Instalar dependências
function Install-Dependencies {
    Write-Log "Instalando dependências..." "INFO"
    
    $dependencies = @(
        @{Name="nodejs"; Version="20.10.0"},
        @{Name="python"; Version="3.11.7"},
        @{Name="git"; Version="2.43.0"},
        @{Name="docker-desktop"; Version="latest"},
        @{Name="postgresql15"; Version="15"},
        @{Name="redis"; Version="latest"},
        @{Name="vscode"; Version="latest"}
    )
    
    foreach ($dep in $dependencies) {
        Write-Log "Instalando $($dep.Name)..." "INFO"
        
        if (Get-Command $dep.Name -ErrorAction SilentlyContinue) {
            Write-Log "$($dep.Name) já instalado" "SUCCESS"
        } else {
            choco install $dep.Name -y --version $dep.Version --force
            Write-Log "$($dep.Name) instalado!" "SUCCESS"
        }
    }
}

# Criar estrutura do projeto
function Create-ProjectStructure {
    Write-Log "Criando estrutura do projeto..." "INFO"
    
    # Estrutura de diretórios
    $directories = @(
        # Backend
        "$ProjectPath\backend\app\api\endpoints",
        "$ProjectPath\backend\app\core",
        "$ProjectPath\backend\app\models",
        "$ProjectPath\backend\app\schemas",
        "$ProjectPath\backend\app\services",
        "$ProjectPath\backend\app\utils",
        "$ProjectPath\backend\tests",
        "$ProjectPath\backend\alembic\versions",
        
        # Frontend
        "$ProjectPath\frontend\src\components\common",
        "$ProjectPath\frontend\src\components\dashboard",
        "$ProjectPath\frontend\src\components\events",
        "$ProjectPath\frontend\src\components\cashless",
        "$ProjectPath\frontend\src\components\tickets",
        "$ProjectPath\frontend\src\pages",
        "$ProjectPath\frontend\src\services",
        "$ProjectPath\frontend\src\hooks",
        "$ProjectPath\frontend\src\utils",
        "$ProjectPath\frontend\src\styles",
        "$ProjectPath\frontend\public",
        
        # Infrastructure
        "$ProjectPath\infrastructure\docker",
        "$ProjectPath\infrastructure\kubernetes",
        "$ProjectPath\infrastructure\terraform",
        "$ProjectPath\infrastructure\nginx",
        "$ProjectPath\infrastructure\monitoring",
        
        # Docs
        "$ProjectPath\docs\api",
        "$ProjectPath\docs\architecture",
        "$ProjectPath\docs\deployment",
        
        # Backups
        "$ProjectPath\backups",
        
        # Logs
        "$ProjectPath\logs"
    )
    
    foreach ($dir in $directories) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    Write-Log "Estrutura criada!" "SUCCESS"
}

# Configurar Backend
function Setup-Backend {
    Write-Log "Configurando Backend FastAPI..." "INFO"
    
    # main.py
    $mainPy = @'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Sistema Universal de Eventos v4.0.0 - Iniciando...")
    yield
    # Shutdown
    print("👋 Sistema encerrado")

app = FastAPI(
    title="Sistema Universal de Eventos",
    version="4.0.0",
    description="Plataforma completa de gestão de eventos - Supreme Edition",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "name": "Sistema Universal de Eventos",
        "version": "4.0.0",
        "status": "online",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "api": "/api/v1"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "4.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
'@
    
    $mainPy | Out-File -FilePath "$ProjectPath\backend\app\main.py" -Encoding UTF8
    
    # requirements.txt
    $requirements = @'
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
asyncpg==0.29.0
redis==5.0.1
celery==5.3.4
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
httpx==0.25.1
stripe==7.8.0
sendgrid==6.11.0
twilio==8.10.3
boto3==1.34.0
pytest==7.4.3
pytest-asyncio==0.21.1
ruff==0.1.7
black==23.12.0
'@
    
    $requirements | Out-File -FilePath "$ProjectPath\backend\requirements.txt" -Encoding UTF8
    
    # Instalar dependências Python
    Set-Location "$ProjectPath\backend"
    Write-Log "Instalando dependências Python..." "INFO"
    & pip install -r requirements.txt 2>$null
    Set-Location $PSScriptRoot
    
    Write-Log "Backend configurado!" "SUCCESS"
}

# Configurar Frontend
function Setup-Frontend {
    Write-Log "Configurando Frontend React..." "INFO"
    
    # package.json
    $packageJson = @'
{
  "name": "sistema-eventos-frontend",
  "version": "4.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.12.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "tailwindcss": "^3.3.6",
    "chart.js": "^4.4.1",
    "react-chartjs-2": "^5.2.0",
    "framer-motion": "^10.16.15",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^2.30.0",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "typescript": "^5.3.3",
    "vite": "^5.0.7",
    "vitest": "^1.0.4"
  }
}
'@
    
    $packageJson | Out-File -FilePath "$ProjectPath\frontend\package.json" -Encoding UTF8
    
    # Instalar dependências
    Set-Location "$ProjectPath\frontend"
    Write-Log "Instalando dependências React..." "INFO"
    & npm install 2>$null
    Set-Location $PSScriptRoot
    
    Write-Log "Frontend configurado!" "SUCCESS"
}

# Configurar Docker
function Setup-Docker {
    Write-Log "Configurando Docker..." "INFO"
    
    # docker-compose.yml
    $dockerCompose = @'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: eventos_postgres
    environment:
      POSTGRES_USER: eventos_user
      POSTGRES_PASSWORD: eventos_pass
      POSTGRES_DB: eventos_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U eventos_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: eventos_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: eventos_backend
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://eventos_user:eventos_pass@postgres/eventos_db
      REDIS_URL: redis://redis:6379
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    container_name: eventos_frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://backend:8000
    volumes:
      - ./frontend:/app

  nginx:
    image: nginx:alpine
    container_name: eventos_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
  redis_data:
'@
    
    $dockerCompose | Out-File -FilePath "$ProjectPath\docker-compose.yml" -Encoding UTF8
    
    # Dockerfile Backend
    $dockerfileBackend = @'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
'@
    
    $dockerfileBackend | Out-File -FilePath "$ProjectPath\backend\Dockerfile" -Encoding UTF8
    
    # Dockerfile Frontend
    $dockerfileFrontend = @'
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
'@
    
    $dockerfileFrontend | Out-File -FilePath "$ProjectPath\frontend\Dockerfile" -Encoding UTF8
    
    Write-Log "Docker configurado!" "SUCCESS"
}

# Configurar ambiente
function Setup-Environment {
    Write-Log "Configurando variáveis de ambiente..." "INFO"
    
    # .env principal
    $envFile = @'
# Database
DATABASE_URL=postgresql+asyncpg://eventos_user:eventos_pass@localhost/eventos_db
SYNC_DATABASE_URL=postgresql://eventos_user:eventos_pass@localhost/eventos_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=supreme-secret-key-change-in-production-2024-ultra-secure
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
REFRESH_TOKEN_EXPIRATION_DAYS=7

# API Keys
OPENAI_API_KEY=sk-your-openai-key
STRIPE_API_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
PIX_API_KEY=your-pix-api-key
PIX_WEBHOOK_URL=https://api.bcb.gov.br/pix/v2

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sistema@eventos.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=Sistema de Eventos <noreply@eventos.com>

# SMS
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+5511999999999

# Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=eventos-storage
AWS_REGION=us-east-1

# Frontend
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Environment
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# Features
ENABLE_WEBSOCKET=true
ENABLE_CACHE=true
ENABLE_RATE_LIMIT=true
ENABLE_MONITORING=true

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
'@
    
    $envFile | Out-File -FilePath "$ProjectPath\.env" -Encoding UTF8
    
    # .env.example
    $envFile | Out-File -FilePath "$ProjectPath\.env.example" -Encoding UTF8
    
    Write-Log "Ambiente configurado!" "SUCCESS"
}

# Migrar componentes HTML
function Migrate-HTMLComponents {
    Write-Log "Migrando componentes HTML para React..." "INFO"
    
    # Mapear arquivos HTML para componentes React
    $htmlFiles = @(
        "landing-page-supreme.html",
        "dashboard-geral-supreme.html",
        "dashboard-clientes-supreme.html",
        "sistema-comandas-supreme.html",
        "modulo-cashless-supreme.html",
        "sistema-equipe-supreme.html",
        "sistema-cardapios-supreme.html",
        "sistema-ingressos-supreme.html",
        "wizard-configuracao-supreme.html"
    )
    
    foreach ($file in $htmlFiles) {
        if (Test-Path "$PSScriptRoot\..\$file") {
            Copy-Item "$PSScriptRoot\..\$file" "$ProjectPath\html-to-convert\" -Force
            Write-Log "Arquivo $file copiado para conversão" "SUCCESS"
        }
    }
    
    Write-Log "Componentes prontos para migração!" "SUCCESS"
}

# Criar scripts auxiliares
function Create-HelperScripts {
    Write-Log "Criando scripts auxiliares..." "INFO"
    
    # start-dev.ps1
    $startDev = @'
Write-Host "🚀 Iniciando Sistema de Eventos - Modo Desenvolvimento" -ForegroundColor Green
docker-compose up -d postgres redis
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
Start-Process "http://localhost:8000/docs"
Write-Host "✅ Sistema iniciado!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
'@
    
    $startDev | Out-File -FilePath "$ProjectPath\start-dev.ps1" -Encoding UTF8
    
    # start-prod.ps1
    $startProd = @'
Write-Host "🚀 Iniciando Sistema de Eventos - Modo Produção" -ForegroundColor Green
docker-compose up -d
Start-Sleep -Seconds 10
Start-Process "http://localhost"
Write-Host "✅ Sistema em produção!" -ForegroundColor Green
'@
    
    $startProd | Out-File -FilePath "$ProjectPath\start-prod.ps1" -Encoding UTF8
    
    # backup.ps1
    $backup = @'
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backup_$timestamp.sql"
Write-Host "📦 Realizando backup do banco de dados..." -ForegroundColor Yellow
docker exec eventos_postgres pg_dump -U eventos_user eventos_db > "backups\$backupFile"
Write-Host "✅ Backup salvo em: backups\$backupFile" -ForegroundColor Green
'@
    
    $backup | Out-File -FilePath "$ProjectPath\backup.ps1" -Encoding UTF8
    
    # monitor.ps1
    $monitor = @'
while ($true) {
    Clear-Host
    Write-Host "📊 MONITOR DO SISTEMA - $(Get-Date)" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Gray
    
    # Status dos containers
    Write-Host "`n🐳 CONTAINERS DOCKER:" -ForegroundColor Yellow
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Uso de recursos
    Write-Host "`n💻 USO DE RECURSOS:" -ForegroundColor Yellow
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    
    # Health check
    Write-Host "`n❤️ HEALTH CHECK:" -ForegroundColor Yellow
    $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -ErrorAction SilentlyContinue
    if ($health) {
        Write-Host "Backend API: ONLINE ✅" -ForegroundColor Green
    } else {
        Write-Host "Backend API: OFFLINE ❌" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 5
}
'@
    
    $monitor | Out-File -FilePath "$ProjectPath\monitor.ps1" -Encoding UTF8
    
    Write-Log "Scripts auxiliares criados!" "SUCCESS"
}

# Inicializar banco de dados
function Initialize-Database {
    Write-Log "Inicializando banco de dados..." "INFO"
    
    # Iniciar containers
    Set-Location $ProjectPath
    docker-compose up -d postgres redis
    Start-Sleep -Seconds 10
    
    # Criar schema inicial
    $initSql = @'
-- Criar schemas
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS audit;

-- Criar tabelas principais
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    cpf VARCHAR(14),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location VARCHAR(500),
    capacity INTEGER,
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    ticket_type VARCHAR(100),
    price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX idx_events_date ON events(start_date, end_date);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);

-- Inserir dados de exemplo
INSERT INTO users (email, password_hash, full_name) VALUES
('admin@eventos.com', '$2b$12$dummy_hash', 'Administrador'),
('teste@eventos.com', '$2b$12$dummy_hash', 'Usuario Teste');

INSERT INTO events (name, description, start_date, end_date, location, capacity) VALUES
('Festival Supreme 2024', 'O maior festival do ano', '2024-12-31 20:00:00', '2025-01-01 06:00:00', 'São Paulo - SP', 10000),
('Balada Royal', 'A festa mais exclusiva', '2024-12-25 22:00:00', '2024-12-26 05:00:00', 'Rio de Janeiro - RJ', 500);
'@
    
    $initSql | docker exec -i eventos_postgres psql -U eventos_user -d eventos_db
    
    Write-Log "Banco de dados inicializado!" "SUCCESS"
    Set-Location $PSScriptRoot
}

# Função principal de instalação
function Install-Complete {
    Show-Banner
    
    Write-Host "`n🚀 INICIANDO INSTALAÇÃO COMPLETA" -ForegroundColor Yellow
    Write-Host "=" * 60 -ForegroundColor Gray
    
    # Criar diretório de logs
    New-Item -ItemType Directory -Path $ProjectPath -Force | Out-Null
    
    # Executar etapas
    $steps = @(
        @{Name="Chocolatey"; Function="Install-Chocolatey"},
        @{Name="Dependências"; Function="Install-Dependencies"},
        @{Name="Estrutura"; Function="Create-ProjectStructure"},
        @{Name="Backend"; Function="Setup-Backend"},
        @{Name="Frontend"; Function="Setup-Frontend"},
        @{Name="Docker"; Function="Setup-Docker"},
        @{Name="Ambiente"; Function="Setup-Environment"},
        @{Name="HTML Migration"; Function="Migrate-HTMLComponents"},
        @{Name="Scripts"; Function="Create-HelperScripts"},
        @{Name="Database"; Function="Initialize-Database"}
    )
    
    $totalSteps = $steps.Count
    $currentStep = 0
    
    foreach ($step in $steps) {
        $currentStep++
        $progress = [math]::Round(($currentStep / $totalSteps) * 100)
        
        Write-Progress -Activity "Instalando Sistema de Eventos" `
                      -Status "$currentStep/$totalSteps - $($step.Name)" `
                      -PercentComplete $progress
        
        & $step.Function
    }
    
    Write-Progress -Activity "Instalando Sistema de Eventos" -Completed
    
    # Resultado final
    Clear-Host
    Show-Banner
    Write-Host "`n✅ INSTALAÇÃO COMPLETA COM SUCESSO!" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Gray
    
    Write-Host "`n📁 Projeto instalado em:" -ForegroundColor Cyan
    Write-Host "   $ProjectPath" -ForegroundColor White
    
    Write-Host "`n🌐 URLs do Sistema:" -ForegroundColor Cyan
    Write-Host "   Frontend: " -NoNewline -ForegroundColor Gray
    Write-Host "http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend:  " -NoNewline -ForegroundColor Gray
    Write-Host "http://localhost:8000" -ForegroundColor White
    Write-Host "   API Docs: " -NoNewline -ForegroundColor Gray
    Write-Host "http://localhost:8000/docs" -ForegroundColor White
    
    Write-Host "`n📝 Comandos disponíveis:" -ForegroundColor Cyan
    Write-Host "   Desenvolvimento: " -NoNewline -ForegroundColor Gray
    Write-Host ".\start-dev.ps1" -ForegroundColor White
    Write-Host "   Produção:        " -NoNewline -ForegroundColor Gray
    Write-Host ".\start-prod.ps1" -ForegroundColor White
    Write-Host "   Monitoramento:   " -NoNewline -ForegroundColor Gray
    Write-Host ".\monitor.ps1" -ForegroundColor White
    Write-Host "   Backup:          " -NoNewline -ForegroundColor Gray
    Write-Host ".\backup.ps1" -ForegroundColor White
    
    Write-Host "`n🎯 Próximos passos:" -ForegroundColor Yellow
    Write-Host "   1. Configure as API keys no arquivo .env"
    Write-Host "   2. Execute .\start-dev.ps1 para iniciar"
    Write-Host "   3. Acesse http://localhost:3000"
    
    Write-Host "`n" -NoNewline
    Write-Host "🎉 Sistema pronto para uso!" -ForegroundColor Magenta
    Write-Host "=" * 60 -ForegroundColor Gray
    
    # Perguntar se deseja iniciar
    Write-Host "`nDeseja iniciar o sistema agora? (S/N): " -NoNewline -ForegroundColor Cyan
    $response = Read-Host
    
    if ($response -eq "S" -or $response -eq "s") {
        Set-Location $ProjectPath
        & ".\start-dev.ps1"
    }
}

# Menu principal
function Show-Menu {
    Clear-Host
    Show-Banner
    
    Write-Host "`nESCOLHA UMA OPÇÃO:" -ForegroundColor Yellow
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host "[1] " -NoNewline -ForegroundColor Cyan; Write-Host "Instalação Completa (Primeira vez)"
    Write-Host "[2] " -NoNewline -ForegroundColor Cyan; Write-Host "Deploy Rápido (Já instalado)"
    Write-Host "[3] " -NoNewline -ForegroundColor Cyan; Write-Host "Modo Desenvolvimento"
    Write-Host "[4] " -NoNewline -ForegroundColor Cyan; Write-Host "Modo Produção"
    Write-Host "[5] " -NoNewline -ForegroundColor Cyan; Write-Host "Verificar Status"
    Write-Host "[6] " -NoNewline -ForegroundColor Cyan; Write-Host "Backup do Sistema"
    Write-Host "[7] " -NoNewline -ForegroundColor Cyan; Write-Host "Monitoramento"
    Write-Host "[8] " -NoNewline -ForegroundColor Cyan; Write-Host "Atualizar Sistema"
    Write-Host "[9] " -NoNewline -ForegroundColor Cyan; Write-Host "Parar Todos os Serviços"
    Write-Host "[0] " -NoNewline -ForegroundColor Cyan; Write-Host "Sair"
    Write-Host "=" * 60 -ForegroundColor Gray
    
    $choice = Read-Host "`nEscolha"
    
    switch ($choice) {
        "1" { Install-Complete }
        "2" { 
            Set-Location "$ProjectPath"
            docker-compose up -d
            Start-Process "http://localhost"
        }
        "3" { 
            Set-Location "$ProjectPath"
            & ".\start-dev.ps1"
        }
        "4" { 
            Set-Location "$ProjectPath"
            & ".\start-prod.ps1"
        }
        "5" { 
            docker ps
            Read-Host "`nPressione Enter para continuar"
        }
        "6" { 
            Set-Location "$ProjectPath"
            & ".\backup.ps1"
            Read-Host "`nPressione Enter para continuar"
        }
        "7" { 
            Set-Location "$ProjectPath"
            & ".\monitor.ps1"
        }
        "8" { 
            Write-Host "Atualizando sistema..." -ForegroundColor Yellow
            Set-Location "$ProjectPath\backend"
            pip install --upgrade -r requirements.txt
            Set-Location "$ProjectPath\frontend"
            npm update
            Write-Host "Sistema atualizado!" -ForegroundColor Green
            Read-Host "`nPressione Enter para continuar"
        }
        "9" { 
            docker-compose down
            Write-Host "Todos os serviços parados!" -ForegroundColor Yellow
            Read-Host "`nPressione Enter para continuar"
        }
        "0" { exit }
        default { 
            Write-Host "Opção inválida!" -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
    
    if ($choice -ne "0") {
        Show-Menu
    }
}

# Executar
Show-Menu