@echo off
chcp 65001 >nul 2>&1
cls
color 0A
title TESTE MASTER ULTRA PERFORMANCE - Sistema de Eventos

echo ================================================================================
echo                      TESTE MASTER ULTRA PERFORMANCE
echo                         SISTEMA DE EVENTOS v4.0
echo ================================================================================
echo.

echo [MASTER] Configurando ambiente para UTF-8...
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1

echo [MASTER] Iniciando Teste Master Ultra Performance...
echo.

python -c "import sys; sys.stdout.reconfigure(encoding='utf-8'); exec(open('TEST_MASTER_ULTRA.py', encoding='utf-8').read())" 2>nul

if %errorlevel% equ 0 (
    echo.
    echo ================================================================================
    echo                    TESTE MASTER CONCLUIDO COM SUCESSO!
    echo ================================================================================
    echo.
    echo Resultados salvos em:
    echo   - test_master_results_*.json
    echo.
) else (
    echo.
    echo [INFO] Executando versao alternativa sem emojis...
    python TEST_MASTER_ULTRA_SAFE.py
)

pause