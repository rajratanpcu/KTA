@echo off
echo ========================================
echo KTA ERP - Redeploy Frontend to Vercel
echo ========================================
echo.
echo Opening Vercel deployment page...
echo.
echo This will deploy the React frontend from your GitHub repository.
echo.
echo Configuration:
echo   Repository: rajratanpcu/KTA
echo   Root Directory: frontend
echo   Build Command: npm run build
echo   Output Directory: dist
echo.
echo Environment Variable to Add:
echo   VITE_API_BASE_URL = https://kta-erp-backend-d7xj.onrender.com
echo.
echo Press any key to open Vercel...
pause >nul

start https://vercel.com/new/clone?repository-url=https://github.com/rajratanpcu/KTA&root-directory=frontend

echo.
echo ========================================
echo Vercel deployment page opened!
echo ========================================
echo.
echo Steps:
echo 1. Click "Import" on your KTA repository
echo 2. Set Root Directory: frontend
echo 3. Add Environment Variable:
echo    Key: VITE_API_BASE_URL
echo    Value: https://kta-erp-backend-d7xj.onrender.com
echo 4. Click "Deploy"
echo.
pause
