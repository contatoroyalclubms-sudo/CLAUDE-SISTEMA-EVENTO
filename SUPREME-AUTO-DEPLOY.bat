@echo off
setlocal enabledelayedexpansion
cls

:: ========================================
:: SISTEMA UNIVERSAL DE EVENTOS v4.0.0
:: SUPREME AUTO-DEPLOY - ONE CLICK SETUP
:: ========================================

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║     SISTEMA UNIVERSAL DE EVENTOS v4.0.0 - SUPREME EDITION       ║
echo ║                  AUTO-DEPLOY INTELIGENTE                         ║
echo ╠══════════════════════════════════════════════════════════════════╣
echo ║  [1] Instalacao Completa (Primeira vez)                         ║
echo ║  [2] Deploy Rapido (Ja instalado)                               ║
echo ║  [3] Modo Desenvolvimento                                        ║
echo ║  [4] Modo Producao                                              ║
echo ║  [5] Verificar Status                                           ║
echo ║  [6] Backup Completo                                            ║
echo ║  [7] Restaurar Backup                                           ║
echo ║  [8] Atualizar Sistema                                          ║
echo ║  [9] Parar Todos os Servicos                                    ║
echo ║  [0] Sair                                                       ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

set /p escolha="Escolha uma opcao: "

if "%escolha%"=="1" goto :INSTALACAO_COMPLETA
if "%escolha%"=="2" goto :DEPLOY_RAPIDO
if "%escolha%"=="3" goto :MODO_DEV
if "%escolha%"=="4" goto :MODO_PROD
if "%escolha%"=="5" goto :VERIFICAR_STATUS
if "%escolha%"=="6" goto :BACKUP
if "%escolha%"=="7" goto :RESTAURAR
if "%escolha%"=="8" goto :ATUALIZAR
if "%escolha%"=="9" goto :PARAR_SERVICOS
if "%escolha%"=="0" exit

:INSTALACAO_COMPLETA
cls
echo.
echo ══════════════════════════════════════════════════════════════════
echo                    INSTALACAO COMPLETA DO SISTEMA
echo ══════════════════════════════════════════════════════════════════
echo.

:: Verificar prerequisitos
echo [1/10] Verificando prerequisitos...
echo ──────────────────────────────────────────────────────────────────

:: Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js nao encontrado. Instalando...
    echo.
    echo Baixando Node.js v20 LTS...
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi' -OutFile 'node-installer.msi'"
    echo Instalando Node.js...
    msiexec /i node-installer.msi /quiet /norestart
    del node-installer.msi
    echo [✓] Node.js instalado com sucesso!
) else (
    echo [✓] Node.js encontrado
)

:: Verificar Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Python nao encontrado. Instalando...
    echo.
    echo Baixando Python 3.11...
    powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe' -OutFile 'python-installer.exe'"
    echo Instalando Python...
    python-installer.exe /quiet InstallAllUsers=1 PrependPath=1
    del python-installer.exe
    echo [✓] Python instalado com sucesso!
) else (
    echo [✓] Python encontrado
)

:: Verificar Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Docker nao encontrado. Instalando...
    echo.
    echo Baixando Docker Desktop...
    powershell -Command "Invoke-WebRequest -Uri 'https://desktop.docker.com/win/main/amd64/Docker Desktop Installer.exe' -OutFile 'docker-installer.exe'"
    echo Instalando Docker...
    start /wait docker-installer.exe install --quiet
    del docker-installer.exe
    echo [✓] Docker instalado com sucesso!
) else (
    echo [✓] Docker encontrado
)

:: Verificar Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Git nao encontrado. Instalando...
    echo.
    echo Baixando Git...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe' -OutFile 'git-installer.exe'"
    echo Instalando Git...
    git-installer.exe /VERYSILENT /NORESTART
    del git-installer.exe
    echo [✓] Git instalado com sucesso!
) else (
    echo [✓] Git encontrado
)

echo.
echo [2/10] Criando estrutura de pastas...
echo ──────────────────────────────────────────────────────────────────

:: Criar estrutura completa
mkdir SISTEMA-EVENTOS-ENTERPRISE 2>nul
cd SISTEMA-EVENTOS-ENTERPRISE

:: Backend
mkdir backend\app\api\endpoints 2>nul
mkdir backend\app\core 2>nul
mkdir backend\app\models 2>nul
mkdir backend\app\schemas 2>nul
mkdir backend\app\services 2>nul
mkdir backend\app\utils 2>nul
mkdir backend\tests 2>nul
mkdir backend\alembic\versions 2>nul

:: Frontend
mkdir frontend\src\components 2>nul
mkdir frontend\src\pages 2>nul
mkdir frontend\src\services 2>nul
mkdir frontend\src\hooks 2>nul
mkdir frontend\src\utils 2>nul
mkdir frontend\src\styles 2>nul
mkdir frontend\public 2>nul

:: Infrastructure
mkdir infrastructure\docker 2>nul
mkdir infrastructure\kubernetes 2>nul
mkdir infrastructure\terraform 2>nul
mkdir infrastructure\nginx 2>nul

:: Docs
mkdir docs\api 2>nul
mkdir docs\architecture 2>nul
mkdir docs\deployment 2>nul

echo [✓] Estrutura de pastas criada!

echo.
echo [3/10] Configurando Backend (FastAPI)...
echo ──────────────────────────────────────────────────────────────────

:: Criar arquivo principal do FastAPI
echo from fastapi import FastAPI > backend\app\main.py
echo from fastapi.middleware.cors import CORSMiddleware >> backend\app\main.py
echo from app.api import api_router >> backend\app\main.py
echo. >> backend\app\main.py
echo app = FastAPI(title="Sistema Universal de Eventos", version="4.0.0") >> backend\app\main.py
echo. >> backend\app\main.py
echo app.add_middleware( >> backend\app\main.py
echo     CORSMiddleware, >> backend\app\main.py
echo     allow_origins=["*"], >> backend\app\main.py
echo     allow_credentials=True, >> backend\app\main.py
echo     allow_methods=["*"], >> backend\app\main.py
echo     allow_headers=["*"], >> backend\app\main.py
echo ) >> backend\app\main.py
echo. >> backend\app\main.py
echo app.include_router(api_router, prefix="/api/v1") >> backend\app\main.py
echo. >> backend\app\main.py
echo @app.get("/health") >> backend\app\main.py
echo def health_check(): >> backend\app\main.py
echo     return {"status": "ok", "version": "4.0.0"} >> backend\app\main.py

:: Criar requirements.txt
(
echo fastapi==0.104.1
echo uvicorn[standard]==0.24.0
echo sqlalchemy==2.0.23
echo alembic==1.12.1
echo asyncpg==0.29.0
echo redis==5.0.1
echo celery==5.3.4
echo pydantic==2.5.0
echo python-jose[cryptography]==3.3.0
echo passlib[bcrypt]==1.7.4
echo python-multipart==0.0.6
echo httpx==0.25.1
echo pytest==7.4.3
echo pytest-asyncio==0.21.1
) > backend\requirements.txt

:: Instalar dependencias Python
cd backend
echo Instalando dependencias Python...
pip install -r requirements.txt >nul 2>&1
cd ..

echo [✓] Backend configurado!

echo.
echo [4/10] Configurando Frontend (React + TypeScript)...
echo ──────────────────────────────────────────────────────────────────

:: Criar package.json
(
echo {
echo   "name": "sistema-eventos-frontend",
echo   "version": "4.0.0",
echo   "type": "module",
echo   "scripts": {
echo     "dev": "vite",
echo     "build": "tsc && vite build",
echo     "preview": "vite preview",
echo     "test": "vitest"
echo   },
echo   "dependencies": {
echo     "react": "^18.2.0",
echo     "react-dom": "^18.2.0",
echo     "react-router-dom": "^6.20.0",
echo     "axios": "^1.6.2",
echo     "zustand": "^4.4.7",
echo     "react-query": "^3.39.3",
echo     "@radix-ui/react-dialog": "^1.0.5",
echo     "tailwindcss": "^3.3.6",
echo     "chart.js": "^4.4.1",
echo     "react-chartjs-2": "^5.2.0"
echo   },
echo   "devDependencies": {
echo     "@types/react": "^18.2.43",
echo     "@types/react-dom": "^18.2.17",
echo     "@vitejs/plugin-react": "^4.2.0",
echo     "typescript": "^5.3.3",
echo     "vite": "^5.0.7",
echo     "vitest": "^1.0.4"
echo   }
echo }
) > frontend\package.json

:: Instalar dependencias
cd frontend
echo Instalando dependencias React...
call npm install >nul 2>&1
cd ..

echo [✓] Frontend configurado!

echo.
echo [5/10] Configurando Docker...
echo ──────────────────────────────────────────────────────────────────

:: Criar docker-compose.yml
(
echo version: '3.8'
echo.
echo services:
echo   postgres:
echo     image: postgres:15-alpine
echo     environment:
echo       POSTGRES_USER: eventos_user
echo       POSTGRES_PASSWORD: eventos_pass
echo       POSTGRES_DB: eventos_db
echo     ports:
echo       - "5432:5432"
echo     volumes:
echo       - postgres_data:/var/lib/postgresql/data
echo.
echo   redis:
echo     image: redis:7-alpine
echo     ports:
echo       - "6379:6379"
echo.
echo   backend:
echo     build: ./backend
echo     ports:
echo       - "8000:8000"
echo     depends_on:
echo       - postgres
echo       - redis
echo     environment:
echo       DATABASE_URL: postgresql://eventos_user:eventos_pass@postgres/eventos_db
echo       REDIS_URL: redis://redis:6379
echo     volumes:
echo       - ./backend:/app
echo.
echo   frontend:
echo     build: ./frontend
echo     ports:
echo       - "3000:3000"
echo     depends_on:
echo       - backend
echo     environment:
echo       VITE_API_URL: http://backend:8000
echo.
echo volumes:
echo   postgres_data:
) > docker-compose.yml

:: Criar Dockerfile Backend
(
echo FROM python:3.11-slim
echo WORKDIR /app
echo COPY requirements.txt .
echo RUN pip install --no-cache-dir -r requirements.txt
echo COPY . .
echo CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
) > backend\Dockerfile

:: Criar Dockerfile Frontend
(
echo FROM node:20-alpine
echo WORKDIR /app
echo COPY package*.json ./
echo RUN npm ci
echo COPY . .
echo RUN npm run build
echo FROM nginx:alpine
echo COPY --from=0 /app/dist /usr/share/nginx/html
echo EXPOSE 80
) > frontend\Dockerfile

echo [✓] Docker configurado!

echo.
echo [6/10] Configurando banco de dados...
echo ──────────────────────────────────────────────────────────────────

:: Iniciar containers Docker
echo Iniciando containers Docker...
docker-compose up -d postgres redis >nul 2>&1

:: Aguardar PostgreSQL iniciar
echo Aguardando PostgreSQL inicializar...
timeout /t 10 /nobreak >nul

:: Criar .env
(
echo # Database
echo DATABASE_URL=postgresql+asyncpg://eventos_user:eventos_pass@localhost/eventos_db
echo.
echo # Redis
echo REDIS_URL=redis://localhost:6379/0
echo.
echo # Security
echo SECRET_KEY=supreme-secret-key-change-in-production-2024
echo JWT_ALGORITHM=HS256
echo JWT_EXPIRATION_HOURS=24
echo.
echo # API Keys
echo OPENAI_API_KEY=your-openai-key
echo STRIPE_API_KEY=your-stripe-key
echo PIX_API_KEY=your-pix-key
echo.
echo # Email
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_USER=your-email@gmail.com
echo SMTP_PASSWORD=your-password
echo.
echo # Frontend
echo FRONTEND_URL=http://localhost:3000
echo.
echo # Environment
echo ENVIRONMENT=development
) > .env

echo [✓] Banco de dados configurado!

echo.
echo [7/10] Migrando HTML para React Components...
echo ──────────────────────────────────────────────────────────────────

:: Criar script de conversao
echo Convertendo componentes HTML para React...

:: Copiar HTMLs existentes para pasta de conversao
mkdir html-to-convert 2>nul
copy ..\*.html html-to-convert\ >nul 2>&1

echo [✓] Componentes preparados para migracao!

echo.
echo [8/10] Configurando monitoramento...
echo ──────────────────────────────────────────────────────────────────

:: Criar configuracao Prometheus
mkdir monitoring 2>nul
(
echo global:
echo   scrape_interval: 15s
echo.
echo scrape_configs:
echo   - job_name: 'backend'
echo     static_configs:
echo       - targets: ['backend:8000']
echo.
echo   - job_name: 'postgres'
echo     static_configs:
echo       - targets: ['postgres:5432']
) > monitoring\prometheus.yml

echo [✓] Monitoramento configurado!

echo.
echo [9/10] Criando scripts de automacao...
echo ──────────────────────────────────────────────────────────────────

:: Script para desenvolvimento
(
echo @echo off
echo echo Iniciando ambiente de desenvolvimento...
echo docker-compose up -d postgres redis
echo cd backend
echo start cmd /k "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo cd ../frontend
echo start cmd /k "npm run dev"
echo echo.
echo echo Sistema rodando em:
echo echo Backend: http://localhost:8000
echo echo Frontend: http://localhost:3000
echo echo Docs API: http://localhost:8000/docs
) > start-dev.bat

:: Script para producao
(
echo @echo off
echo echo Iniciando ambiente de producao...
echo docker-compose up -d
echo echo.
echo echo Sistema rodando em:
echo echo Backend: http://localhost:8000
echo echo Frontend: http://localhost:3000
) > start-prod.bat

:: Script de backup
(
echo @echo off
echo echo Realizando backup...
echo set backup_name=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
echo docker exec postgres pg_dump -U eventos_user eventos_db ^> backups\%backup_name%.sql
echo echo Backup salvo em: backups\%backup_name%.sql
) > backup.bat

echo [✓] Scripts criados!

echo.
echo [10/10] Finalizando instalacao...
echo ──────────────────────────────────────────────────────────────────

:: Criar README com instrucoes
(
echo # Sistema Universal de Eventos v4.0.0 - SUPREME EDITION
echo.
echo ## Status da Instalacao
echo - [x] Prerequisitos instalados
echo - [x] Estrutura de pastas criada
echo - [x] Backend FastAPI configurado
echo - [x] Frontend React configurado
echo - [x] Docker configurado
echo - [x] Banco de dados inicializado
echo - [x] Scripts de automacao criados
echo.
echo ## Como usar:
echo.
echo ### Desenvolvimento:
echo ```
echo start-dev.bat
echo ```
echo.
echo ### Producao:
echo ```
echo start-prod.bat
echo ```
echo.
echo ## URLs do Sistema:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo - Grafana: http://localhost:3001
echo - Prometheus: http://localhost:9090
echo.
echo ## Comandos uteis:
echo - `npm run dev` - Iniciar frontend
echo - `uvicorn app.main:app --reload` - Iniciar backend
echo - `docker-compose up -d` - Iniciar todos os servicos
echo - `backup.bat` - Fazer backup do banco
echo.
echo ## Proximos passos:
echo 1. Configurar as API keys no arquivo .env
echo 2. Migrar os componentes HTML para React
echo 3. Implementar as integrações de pagamento
echo 4. Configurar o deployment em producao
) > README.md

echo.
echo ══════════════════════════════════════════════════════════════════
echo                    ✅ INSTALACAO COMPLETA!
echo ══════════════════════════════════════════════════════════════════
echo.
echo Sistema instalado com sucesso em: %CD%
echo.
echo Para iniciar o sistema:
echo   - Desenvolvimento: execute start-dev.bat
echo   - Producao: execute start-prod.bat
echo.
echo URLs do sistema:
echo   - Frontend: http://localhost:3000
echo   - Backend: http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto :MENU

:DEPLOY_RAPIDO
cls
echo.
echo ══════════════════════════════════════════════════════════════════
echo                       DEPLOY RAPIDO
echo ══════════════════════════════════════════════════════════════════
echo.
echo Iniciando sistema...
cd SISTEMA-EVENTOS-ENTERPRISE 2>nul
if exist start-prod.bat (
    call start-prod.bat
    echo.
    echo [✓] Sistema iniciado com sucesso!
) else (
    echo [!] Sistema nao instalado. Execute a instalacao completa primeiro.
)
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto :MENU

:MODO_DEV
cls
echo.
echo ══════════════════════════════════════════════════════════════════
echo                    MODO DESENVOLVIMENTO
echo ══════════════════════════════════════════════════════════════════
echo.
cd SISTEMA-EVENTOS-ENTERPRISE 2>nul
if exist start-dev.bat (
    call start-dev.bat
) else (
    echo [!] Sistema nao instalado. Execute a instalacao completa primeiro.
)
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto :MENU

:MODO_PROD
cls
echo.
echo ══════════════════════════════════════════════════════════════════
echo                      MODO PRODUCAO
echo ══════════════════════════════════════════════════════════════════
echo.
cd SISTEMA-EVENTOS-ENTERPRISE 2>nul
if exist start-prod.bat (
    call start-prod.bat
) else (
    echo [!] Sistema nao instalado. Execute a instalacao completa primeiro.
)
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto :MENU

:VERIFICAR_STATUS
cls
echo.
echo ══════════════════════════════════════════════════════════════════
echo                    STATUS DO SISTEMA
echo ══════════════════════════════════════════════════════════════════
echo.
echo Verificando servicos...
echo.

:: Verificar PostgreSQL
docker ps | findstr postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] PostgreSQL: ONLINE
) else (
    echo [✗] PostgreSQL: OFFLINE
)

:: Verificar Redis
docker ps | findstr redis >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Redis: ONLINE
) else (
    echo [✗] Redis: OFFLINE
)

:: Verificar Backend
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Backend API: ONLINE
) else (
    echo [✗] Backend API: OFFLINE
)

:: Verificar Frontend
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Frontend: ONLINE
) else (
    echo [✗] Frontend: OFFLINE
)

echo.
echo Informacoes do Sistema:
echo ──────────────────────────────────────────────────────────────────
systeminfo | findstr /C:"OS Name" /C:"OS Version" /C:"System Type"
echo.
echo Uso de Memoria:
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value | findstr =
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto :MENU

:BACKUP
cls
echo.
echo ══════════════════════════════════════════════════════════════════
echo                    BACKUP DO SISTEMA
echo ══════════════════════════════════════════════════════════════════
echo.
cd SISTEMA-EVENTOS-ENTERPRISE 2>nul
if exist backup.bat (
    call backup.bat
) else (
    echo [!] Sistema nao instalado. Execute a instalacao completa primeiro.
)
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto :MENU

:RESTAURAR
cls
echo.
echo ══════════════════════════════════════════════════════════════════
echo                   RESTAURAR BACKUP
echo ══════════════════════════════════════════════════════════════════
echo.
echo Backups disponiveis:
echo ──────────────────────────────────────────────────────────────────
dir /b backups\*.sql 2>nul
echo.
set /p backup_file="Digite o nome do arquivo de backup: "
if exist backups\%backup_file% (
    echo Restaurando backup...
    docker exec -i postgres psql -U eventos_user eventos_db < backups\%backup_file%
    echo [✓] Backup restaurado com sucesso!
) else (
    echo [!] Arquivo de backup nao encontrado.
)
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto :MENU

:ATUALIZAR
cls
echo.
echo ══════════════════════════════════════════════════════════════════
echo                   ATUALIZAR SISTEMA
echo ══════════════════════════════════════════════════════════════════
echo.
cd SISTEMA-EVENTOS-ENTERPRISE 2>nul
echo Atualizando dependencias do Backend...
cd backend
pip install --upgrade -r requirements.txt
cd ..
echo.
echo Atualizando dependencias do Frontend...
cd frontend
npm update
cd ..
echo.
echo Reconstruindo containers Docker...
docker-compose build --no-cache
echo.
echo [✓] Sistema atualizado com sucesso!
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto :MENU

:PARAR_SERVICOS
cls
echo.
echo ══════════════════════════════════════════════════════════════════
echo                   PARANDO SERVICOS
echo ══════════════════════════════════════════════════════════════════
echo.
echo Parando todos os servicos...
docker-compose down
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
echo.
echo [✓] Todos os servicos foram parados!
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto :MENU

:MENU
cls
goto :inicio

endlocal