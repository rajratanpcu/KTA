@echo off
echo ========================================
echo KTA ERP - Deploy Frontend to Vercel
echo ========================================
echo.
echo Backend URL: https://kta-erp-backend-d7xj.onrender.com
echo.
echo Opening Vercel deployment...
echo.
pause

start https://vercel.com/new/clone?repository-url=https://github.com/rajratanpcu/KTA&root-directory=frontend

echo.
echo ========================================
echo Configuration for Vercel:
echo ========================================
echo.
echo Project Name: kta-erp (or your choice)
echo Root Directory: frontend
echo Framework: Vite (auto-detected)
echo.
echo Environment Variable to Add:
echo   Key: VITE_API_BASE_URL
echo   Value: https://kta-erp-backend-d7xj.onrender.com
echo.
echo After deployment completes, you'll get a Vercel URL.
echo Then we need to update CORS on the backend with that URL.
echo.
pause
