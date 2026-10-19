@echo off
echo ========================================
echo KTA ERP - One-Click Render Deployment
echo ========================================
echo.
echo Opening Render deployment page...
echo.
echo This will use your render.yaml blueprint to automatically:
echo   - Link to existing kta-erp-postgres database
echo   - Configure Spring Boot backend service
echo   - Set up Docker build with correct paths
echo.
echo You will need to add these environment variables:
echo   - CORS_ALLOWED_ORIGINS = https://kta2.vercel.app
echo   - ADMIN_USERNAME = admin
echo   - ADMIN_PASSWORD = AdminPassword123!
echo.
echo Press any key to open Render deployment...
pause >nul

start https://render.com/deploy?repo=https://github.com/rajratanpcu/KTA

echo.
echo ========================================
echo Deployment page opened in your browser
echo ========================================
echo.
echo After deployment completes:
echo   1. Copy your backend URL (e.g., https://kta-backend-xxxx.onrender.com)
echo   2. Update Vercel VITE_API_BASE_URL to that URL
echo   3. Redeploy frontend on Vercel
echo.
pause
