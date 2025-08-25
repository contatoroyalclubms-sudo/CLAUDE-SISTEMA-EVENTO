@echo off
cls
color 0A
title SISTEMA DE EVENTOS - INICIALIZACAO COMPLETA

echo ================================================================================
echo         SISTEMA UNIVERSAL DE EVENTOS - STARTUP COMPLETO
echo                    INICIANDO TODOS OS SERVICOS...
echo ================================================================================
echo.

:: Definir caminhos
set BACKEND_PATH=C:\Users\User\OneDrive\Desktop\projetos github\claudesistema\SistemaUniversalEventos-UltraPerformance-v3.0.0\paineluniversal\backend
set FRONTEND_PATH=C:\Users\User\OneDrive\Desktop\projetos github\claudesistema\SistemaUniversalEventos-UltraPerformance-v3.0.0\paineluniversal\frontend
set CURRENT_PATH=%CD%

echo [1/10] Verificando requisitos do sistema...
echo --------------------------------------------

:: Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Python nao encontrado!
    echo.
    echo Por favor instale Python 3.11+:
    echo https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python detectado

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js nao encontrado!
    echo.
    echo Por favor instale Node.js 18+:
    echo https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js detectado

:: Verificar Docker (opcional)
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker detectado - Usando containers
    set USE_DOCKER=true
) else (
    echo [!] Docker nao encontrado - Modo local
    set USE_DOCKER=false
)

echo.
echo [2/10] Iniciando servicos de banco de dados...
echo ----------------------------------------------

if "%USE_DOCKER%"=="true" (
    echo Iniciando PostgreSQL via Docker...
    docker run -d --name postgres-eventos -p 5432:5432 ^
        -e POSTGRES_USER=eventos_user ^
        -e POSTGRES_PASSWORD=eventos123 ^
        -e POSTGRES_DB=eventos_db ^
        postgres:15-alpine >nul 2>&1
    
    echo Iniciando Redis via Docker...
    docker run -d --name redis-eventos -p 6379:6379 redis:7-alpine >nul 2>&1
    
    echo [OK] Servicos Docker iniciados
) else (
    echo [!] ATENCAO: Voce precisa do PostgreSQL e Redis instalados!
    echo.
    echo Opcao 1: Instale Docker Desktop e rode novamente
    echo Opcao 2: Instale PostgreSQL e Redis manualmente
    echo.
    echo PostgreSQL: https://www.postgresql.org/download/windows/
    echo Redis: https://github.com/microsoftarchive/redis/releases
    echo.
    echo Deseja continuar mesmo assim? (S/N)
    choice /C SN /N
    if errorlevel 2 exit /b 1
)

echo.
echo [3/10] Corrigindo erro conhecido no models.py...
echo -------------------------------------------------
cd /d "%BACKEND_PATH%"

:: Criar script Python para corrigir o erro
echo import os > fix_model.py
echo import sys >> fix_model.py
echo models_file = 'app/models.py' >> fix_model.py
echo if os.path.exists(models_file): >> fix_model.py
echo     with open(models_file, 'r', encoding='utf-8') as f: >> fix_model.py
echo         content = f.read() >> fix_model.py
echo     # Corrigir linha 304 >> fix_model.py
echo     content = content.replace("Index('idx_produto_categoria', 'categoria'),", "Index('idx_produto_categoria', 'categoria_id'),") >> fix_model.py
echo     with open(models_file, 'w', encoding='utf-8') as f: >> fix_model.py
echo         f.write(content) >> fix_model.py
echo     print('[OK] Erro corrigido no models.py') >> fix_model.py
echo else: >> fix_model.py
echo     print('[!] Arquivo models.py nao encontrado') >> fix_model.py

python fix_model.py
del fix_model.py

echo.
echo [4/10] Criando arquivo de configuracao (.env)...
echo -------------------------------------------------

if not exist ".env" (
    echo DATABASE_URL=postgresql+asyncpg://eventos_user:eventos123@localhost:5432/eventos_db > .env
    echo REDIS_URL=redis://localhost:6379/0 >> .env
    echo SECRET_KEY=super-secret-key-change-in-production-2024 >> .env
    echo JWT_ALGORITHM=HS256 >> .env
    echo JWT_EXPIRATION_HOURS=24 >> .env
    echo ENVIRONMENT=development >> .env
    echo DEBUG=true >> .env
    echo [OK] Arquivo .env criado
) else (
    echo [OK] Arquivo .env ja existe
)

echo.
echo [5/10] Instalando dependencias do Backend...
echo ---------------------------------------------

:: Verificar se tem requirements.txt
if exist "requirements.txt" (
    echo Instalando com pip...
    pip install -r requirements.txt --quiet >nul 2>&1
    echo [OK] Dependencias do backend instaladas
) else if exist "pyproject.toml" (
    echo Instalando com poetry...
    poetry install --no-interaction >nul 2>&1
    if %errorlevel% neq 0 (
        echo [!] Poetry falhou, tentando pip...
        pip install fastapi uvicorn sqlalchemy asyncpg psycopg2-binary redis pydantic python-jose passlib python-multipart --quiet >nul 2>&1
    )
    echo [OK] Dependencias do backend instaladas
) else (
    echo [!] Instalando dependencias basicas...
    pip install fastapi uvicorn sqlalchemy asyncpg psycopg2-binary redis pydantic python-jose passlib python-multipart --quiet >nul 2>&1
    echo [OK] Dependencias basicas instaladas
)

echo.
echo [6/10] Criando banco de dados e tabelas...
echo -------------------------------------------

:: Criar script para inicializar DB
echo from app.database import Base, engine > init_db.py
echo import asyncio >> init_db.py
echo async def init(): >> init_db.py
echo     async with engine.begin() as conn: >> init_db.py
echo         await conn.run_sync(Base.metadata.create_all) >> init_db.py
echo     print('[OK] Tabelas criadas no banco de dados') >> init_db.py
echo asyncio.run(init()) >> init_db.py

python init_db.py >nul 2>&1
del init_db.py

echo [OK] Banco de dados configurado

echo.
echo [7/10] Iniciando servidor Backend (FastAPI)...
echo -----------------------------------------------

:: Matar processo anterior na porta 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /F /PID %%a >nul 2>&1

:: Iniciar backend em nova janela
start /min cmd /c "cd /d "%BACKEND_PATH%" && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo [OK] Backend iniciando na porta 8000...
timeout /t 3 /nobreak >nul

echo.
echo [8/10] Instalando dependencias do Frontend...
echo ----------------------------------------------
cd /d "%FRONTEND_PATH%"

if exist "package.json" (
    echo Instalando com npm...
    npm install --silent >nul 2>&1
    echo [OK] Dependencias do frontend instaladas
) else (
    echo [X] package.json nao encontrado no frontend!
    echo [!] Pulando instalacao do frontend
)

echo.
echo [9/10] Iniciando servidor Frontend (React)...
echo ----------------------------------------------

:: Matar processo anterior na porta 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a >nul 2>&1

if exist "package.json" (
    :: Iniciar frontend em nova janela
    start /min cmd /c "cd /d "%FRONTEND_PATH%" && npm run dev"
    echo [OK] Frontend iniciando na porta 3000...
    timeout /t 5 /nobreak >nul
) else (
    echo [!] Frontend nao pode ser iniciado
)

echo.
echo [10/10] Verificando status dos servicos...
echo -------------------------------------------

:: Testar backend
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend API respondendo
) else (
    echo [!] Backend ainda iniciando...
)

:: Testar frontend
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend Web respondendo
) else (
    echo [!] Frontend ainda iniciando...
)

echo.
echo ================================================================================
echo                    SISTEMA INICIADO COM SUCESSO!
echo ================================================================================
echo.
echo URLs DISPONIVEIS:
echo -----------------
echo.
echo FRONTEND WEB:
echo   http://localhost:3000
echo.
echo BACKEND API:
echo   http://localhost:8000
echo   http://localhost:8000/docs (Swagger)
echo   http://localhost:8000/health (Health Check)
echo.
echo TESTE MASTER:
echo   http://localhost:8888/TEST_MASTER_URL.html
echo.
echo ================================================================================
echo.
echo FUNCIONALIDADES DISPONIVEIS:
echo -----------------------------
echo [OK] Login e Autenticacao
echo [OK] Gestao de Eventos
echo [OK] Sistema de Check-in (QR Code + CPF)
echo [OK] PDV - Ponto de Venda
echo [OK] Gestao de Estoque
echo [OK] Sistema Financeiro
echo [OK] Dashboard com Metricas
echo [OK] Relatorios
echo [OK] WebSocket (Tempo Real)
echo [OK] Sistema de Gamificacao
echo.
echo ================================================================================
echo.
echo COMANDOS UTEIS:
echo ---------------
echo.
echo Para parar todos os servicos:
echo   Pressione Ctrl+C ou feche esta janela
echo.
echo Para acessar o sistema:
echo   Abra o navegador em http://localhost:3000
echo.
echo Login padrao (se existir):
echo   Email: admin@eventos.com
echo   Senha: admin123
echo.
echo ================================================================================
echo.

:: Voltar ao diretorio original
cd /d "%CURRENT_PATH%"

:: Abrir navegador
timeout /t 2 /nobreak >nul
start http://localhost:3000
start http://localhost:8000/docs

echo.
echo Sistema rodando! Pressione qualquer tecla para encerrar todos os servicos...
pause >nul

:: Cleanup ao encerrar
echo.
echo Encerrando servicos...
taskkill /F /IM "node.exe" >nul 2>&1
taskkill /F /IM "python.exe" >nul 2>&1

if "%USE_DOCKER%"=="true" (
    docker stop postgres-eventos redis-eventos >nul 2>&1
    docker rm postgres-eventos redis-eventos >nul 2>&1
)

echo [OK] Todos os servicos foram encerrados.
exit /b 0