@echo off
echo 🧪 TESTE RÁPIDO DO SISTEMA
echo =========================

echo.
echo 📦 Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado! Execute setup-torre-suprema.bat primeiro
    pause
    exit /b 1
)

echo.
echo 🗄️ Verificando PostgreSQL...
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL não encontrado! Execute setup-torre-suprema.bat primeiro
    pause
    exit /b 1
)

echo.
echo 📊 Verificando se o banco existe...
psql -U postgres -lqt | findstr torre_suprema_memory >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔧 Criando banco de dados...
    psql -U postgres -c "CREATE DATABASE torre_suprema_memory;"
    psql -U postgres -c "CREATE USER torre_admin WITH PASSWORD 'suprema_power_2024';"
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE torre_suprema_memory TO torre_admin;"
    
    echo 📊 Executando schema...
    psql -U torre_admin -d torre_suprema_memory -f "src\core\context-database.sql"
)

echo.
echo 🧪 Executando testes do sistema...
node test-context-system.js

echo.
echo ✅ TESTE CONCLUÍDO!
pause