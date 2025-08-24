@echo off
echo ========================================
echo 🚀 TORRE SUPREMA - MODO LITE
echo ========================================
echo.
echo Iniciando com configuracoes minimas...
echo.

REM Configurar para usar menos memoria
set NODE_OPTIONS=--max-old-space-size=1024
set DISABLE_AUTO_DOCS=true
set DISABLE_MONITORING=true

REM Iniciar apenas com comandos essenciais
node node_modules\ts-node\dist\bin.js src\torre-suprema-cli.ts

pause