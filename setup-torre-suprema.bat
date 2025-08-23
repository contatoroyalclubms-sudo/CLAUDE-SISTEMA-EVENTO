@echo off
echo 🚀 SETUP TORRE SUPREMA - INSTALAÇÃO COMPLETA
echo ============================================

echo.
echo 📦 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo 📥 Baixando Node.js...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.18.0/node-v18.18.0-x64.msi' -OutFile 'nodejs.msi'}"
    echo 🔧 Instalando Node.js...
    msiexec /i nodejs.msi /quiet
    del nodejs.msi
) else (
    echo ✅ Node.js encontrado!
    node --version
)

echo.
echo 📦 Verificando PostgreSQL...
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL não encontrado!
    echo 📥 Baixando PostgreSQL...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-15.4-1-windows-x64.exe' -OutFile 'postgresql.exe'}"
    echo 🔧 Instalando PostgreSQL...
    postgresql.exe --mode unattended --unattendedmodeui minimal --disable-components stackbuilder --superpassword "suprema_power_2024"
    del postgresql.exe
) else (
    echo ✅ PostgreSQL encontrado!
    psql --version
)

echo.
echo 📦 Verificando Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git não encontrado!
    echo 📥 Baixando Git...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.2/Git-2.42.0.2-64-bit.exe' -OutFile 'git.exe'}"
    echo 🔧 Instalando Git...
    git.exe /VERYSILENT /NORESTART
    del git.exe
) else (
    echo ✅ Git encontrado!
    git --version
)

echo.
echo 📦 Instalando dependências do projeto...
npm install

echo.
echo 🗄️ Configurando banco de dados...
echo Criando arquivo .env...
copy .env.example .env

echo.
echo 🔧 Verificando se PostgreSQL está rodando...
net start postgresql-x64-15 >nul 2>&1

echo.
echo 🗄️ Criando banco de dados...
psql -U postgres -c "CREATE DATABASE torre_suprema_memory;" 2>nul
psql -U postgres -c "CREATE USER torre_admin WITH PASSWORD 'suprema_power_2024';" 2>nul
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE torre_suprema_memory TO torre_admin;" 2>nul

echo.
echo 📊 Executando schema do banco...
psql -U torre_admin -d torre_suprema_memory -f "src\core\context-database.sql"

echo.
echo ✅ SETUP COMPLETO!
echo.
echo 🚀 Para testar:
echo    npm run test:context
echo.
echo 🎯 Para iniciar:
echo    npm run dev
echo.

pause