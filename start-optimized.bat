@echo off
echo ========================================
echo 🚀 INICIANDO TORRE SUPREMA OTIMIZADO
echo ========================================
echo.

REM Limpar memoria antes de iniciar
echo 🧹 Limpando memoria...
npm cache clean --force >nul 2>&1

REM Configurar variaveis de ambiente para otimizacao
set NODE_OPTIONS=--max-old-space-size=2048 --expose-gc
set NODE_ENV=production

echo ⚡ Configuracoes de otimizacao aplicadas:
echo    - Memoria maxima: 2GB
echo    - Garbage Collection: Ativado
echo    - Modo: Production
echo.

echo 🏰 Iniciando Torre Suprema Enterprise...
echo ========================================
echo.

REM Iniciar com parametros otimizados
node --expose-gc --max-old-space-size=2048 node_modules\ts-node\dist\bin.js src\torre-suprema-enterprise-cli.ts

pause