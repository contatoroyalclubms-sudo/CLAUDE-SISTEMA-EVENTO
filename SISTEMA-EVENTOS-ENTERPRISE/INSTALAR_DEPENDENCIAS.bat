@echo off
cls
color 0E
title INSTALACAO DE DEPENDENCIAS - Sistema de Eventos

echo ================================================================================
echo                 INSTALACAO AUTOMATICA DE DEPENDENCIAS
echo                      SISTEMA DE EVENTOS v4.0
echo ================================================================================
echo.

echo Este script vai instalar tudo que voce precisa para rodar o sistema!
echo.
pause

echo.
echo [PASSO 1] Verificando o que ja esta instalado...
echo -------------------------------------------------

:: Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python ja instalado
) else (
    echo [!] Python NAO encontrado
    echo.
    echo Baixando Python...
    echo Por favor, instale manualmente de:
    echo https://www.python.org/downloads/
    echo.
    echo Certifique-se de marcar "Add Python to PATH"!
    start https://www.python.org/downloads/
    pause
)

:: Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js ja instalado
) else (
    echo [!] Node.js NAO encontrado
    echo.
    echo Baixando Node.js...
    echo Por favor, instale manualmente de:
    echo https://nodejs.org/
    start https://nodejs.org/
    pause
)

:: Git
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Git ja instalado
) else (
    echo [!] Git NAO encontrado (opcional)
)

echo.
echo [PASSO 2] Instalando Docker Desktop (para banco de dados)...
echo -------------------------------------------------------------

docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker ja instalado
) else (
    echo [!] Docker NAO encontrado
    echo.
    echo Docker e necessario para rodar PostgreSQL e Redis facilmente.
    echo.
    echo Opcoes:
    echo 1. Instalar Docker Desktop (recomendado)
    echo 2. Instalar PostgreSQL e Redis manualmente
    echo.
    echo Abrindo pagina do Docker Desktop...
    start https://www.docker.com/products/docker-desktop/
    echo.
    echo Apos instalar o Docker, rode este script novamente.
    pause
)

echo.
echo [PASSO 3] Instalando dependencias Python...
echo --------------------------------------------

:: Atualizar pip
python -m pip install --upgrade pip >nul 2>&1
echo [OK] pip atualizado

:: Instalar dependencias essenciais
echo Instalando FastAPI e dependencias...
pip install fastapi uvicorn[standard] sqlalchemy asyncpg psycopg2-binary redis aioredis pydantic python-jose[cryptography] passlib[bcrypt] python-multipart httpx pytest --quiet >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] Dependencias Python instaladas
) else (
    echo [!] Algumas dependencias falharam, tentando individualmente...
    pip install fastapi --quiet
    pip install uvicorn --quiet
    pip install sqlalchemy --quiet
    pip install asyncpg --quiet
    pip install redis --quiet
    pip install pydantic --quiet
)

echo.
echo [PASSO 4] Criando containers Docker...
echo ---------------------------------------

if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    echo Iniciando Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    timeout /t 10 /nobreak >nul
)

docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo Criando container PostgreSQL...
    docker run -d --name postgres-eventos -p 5432:5432 -e POSTGRES_USER=eventos_user -e POSTGRES_PASSWORD=eventos123 -e POSTGRES_DB=eventos_db postgres:15-alpine >nul 2>&1
    
    if %errorlevel% equ 0 (
        echo [OK] PostgreSQL rodando na porta 5432
    ) else (
        echo [!] Container PostgreSQL ja existe ou erro ao criar
        docker start postgres-eventos >nul 2>&1
    )
    
    echo.
    echo Criando container Redis...
    docker run -d --name redis-eventos -p 6379:6379 redis:7-alpine >nul 2>&1
    
    if %errorlevel% equ 0 (
        echo [OK] Redis rodando na porta 6379
    ) else (
        echo [!] Container Redis ja existe ou erro ao criar
        docker start redis-eventos >nul 2>&1
    )
) else (
    echo [!] Docker nao disponivel - instale PostgreSQL e Redis manualmente
)

echo.
echo [PASSO 5] Verificando instalacoes...
echo -------------------------------------

echo.
echo RESUMO DA INSTALACAO:
echo ----------------------

python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python .............. INSTALADO
) else (
    echo [X] Python .............. NAO INSTALADO
)

node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js ............. INSTALADO
) else (
    echo [X] Node.js ............. NAO INSTALADO
)

docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker .............. INSTALADO
    
    docker ps | findstr postgres-eventos >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] PostgreSQL .......... RODANDO
    ) else (
        echo [!] PostgreSQL .......... PARADO
    )
    
    docker ps | findstr redis-eventos >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Redis ............... RODANDO
    ) else (
        echo [!] Redis ............... PARADO
    )
) else (
    echo [!] Docker .............. NAO INSTALADO
    echo [!] PostgreSQL .......... REQUER INSTALACAO MANUAL
    echo [!] Redis ............... REQUER INSTALACAO MANUAL
)

echo.
echo ================================================================================
echo.

:: Verificar se tudo está OK
python --version >nul 2>&1
if %errorlevel% neq 0 goto :missing_deps

node --version >nul 2>&1
if %errorlevel% neq 0 goto :missing_deps

echo SUCESSO! Todas as dependencias principais estao instaladas!
echo.
echo Agora voce pode rodar o sistema com:
echo   RODAR_SISTEMA_COMPLETO.bat
echo.
goto :end

:missing_deps
echo ATENCAO! Algumas dependencias estao faltando.
echo.
echo Por favor instale manualmente:
echo - Python: https://www.python.org/downloads/
echo - Node.js: https://nodejs.org/
echo - Docker: https://www.docker.com/products/docker-desktop/
echo.

:end
echo ================================================================================
echo.
pause