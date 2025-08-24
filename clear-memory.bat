@echo off
echo 🧹 Limpando memoria do sistema...
echo.

REM Limpar cache do npm
echo Limpando cache do npm...
npm cache clean --force

REM Limpar arquivos temporarios
echo Limpando arquivos temporarios...
del /q /s "%TEMP%\*" 2>nul
rd /s /q "%TEMP%" 2>nul
md "%TEMP%"

REM Forcar garbage collection do Node
echo Forcando limpeza de memoria do Node.js...
node -e "if (global.gc) { global.gc(); console.log('GC executado!'); } else { console.log('Execute com --expose-gc'); }"

REM Limpar logs antigos
echo Limpando logs antigos...
if exist "logs" (
    del /q logs\*.log 2>nul
)

if exist "docs\torre-suprema" (
    echo Limpando documentacao temporaria...
    rd /s /q "docs\torre-suprema" 2>nul
)

echo.
echo ✅ Limpeza concluida!
echo.
echo Agora execute novamente:
echo npm run suprema
echo.
pause