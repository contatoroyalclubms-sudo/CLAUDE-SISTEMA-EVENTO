@echo off
cls
color 0A
title ABRIR TESTE MASTER ULTRA PERFORMANCE

echo ================================================================================
echo            TESTE MASTER ULTRA PERFORMANCE - DASHBOARD WEB
echo ================================================================================
echo.

echo [INFO] Abrindo dashboard de teste master no navegador...
echo.

:: Abrir arquivo HTML diretamente
start "" "%~dp0TEST_MASTER_URL.html"

echo URLs DISPONIVEIS:
echo ----------------
echo.
echo TESTE MASTER (Principal):
echo file:///%~dp0TEST_MASTER_URL.html
echo.
echo DASHBOARD MONITORAMENTO:
echo file:///%~dp0DASHBOARD_MONITORAMENTO.html
echo.
echo RELATORIO DE PERFORMANCE:
echo file:///%~dp0RELATORIO_PERFORMANCE_ULTRA.md
echo.
echo RESULTADOS DO TESTE:
echo file:///%~dp0TEST_RESULTS_MASTER.txt
echo.
echo ================================================================================
echo.
echo Dashboard aberto no navegador!
echo.
echo Para iniciar servidor web local (opcional):
echo   python START_TEST_MASTER_SERVER.py
echo.
echo Isso disponibilizara o dashboard em:
echo   http://localhost:8888
echo.
pause