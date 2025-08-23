@echo off
echo 🚀 TORRE SUPREMA - DEPLOY AUTOMÁTICO
echo ====================================

echo.
echo 📦 Adicionando novos arquivos...
git add .

echo.
echo 💾 Fazendo commit...
git commit -m "🌐 Auto-deploy configuration added

✨ Added:
- GitHub Actions workflow for CI/CD
- Netlify configuration for instant deploy  
- Vite PWA configuration
- Production-ready HTML with loading screen
- React main entry point

🚀 Ready for automatic deployment to:
- Vercel (recommended)
- Netlify (alternative) 
- GitHub Pages (backup)

🧠 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

echo.
echo 🌍 Enviando para GitHub...
git push

echo.
echo ✅ DEPLOY AUTOMÁTICO CONFIGURADO!
echo.
echo 🎯 Próximos passos:
echo    1. Acesse: https://vercel.com
echo    2. Login com GitHub
echo    3. "New Project" → Selecione "claude-ia"
echo    4. Deploy automático será ativado!
echo.
echo 🌐 Ou use Netlify:
echo    1. Acesse: https://netlify.com
echo    2. "New site from Git" → GitHub
echo    3. Selecione "claude-ia"
echo    4. Deploy automático!
echo.

pause