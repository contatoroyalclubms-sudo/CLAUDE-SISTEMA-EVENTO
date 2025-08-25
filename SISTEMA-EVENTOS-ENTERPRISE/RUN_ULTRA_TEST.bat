@echo off
chcp 65001 >nul
cls
color 0A
title TESTE ULTRA PERFORMANCE - Sistema de Eventos

echo ================================================================================
echo           TESTE ULTRA PERFORMANCE - SISTEMA DE EVENTOS
echo ================================================================================
echo.

echo [INFO] Verificando servidor...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Servidor nao esta rodando!
    echo.
    echo Por favor, inicie o servidor primeiro:
    echo   1. Execute: ATIVACAO_SUPREMA.bat
    echo   2. Ou: python AUTO_DEPLOY_SUPREMO.py --type local
    echo.
    pause
    exit /b 1
)

echo [OK] Servidor detectado!
echo.
echo [INFO] Iniciando testes de performance...
echo.

python -c "import sys; sys.stdout.reconfigure(encoding='utf-8')" 2>nul
python TEST_ULTRA_PERFORMANCE.py

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Teste falhou!
    pause
    exit /b 1
)

echo.
echo ================================================================================
echo                    TESTE CONCLUIDO COM SUCESSO!
echo ================================================================================
echo.
echo Verifique os arquivos de resultado:
echo   - performance_test_results_*.json
echo   - performance_test_report_*.txt
echo.
pause