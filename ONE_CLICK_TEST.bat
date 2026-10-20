@echo off
title KTA ERP - One-Click Production Testing
color 0a

echo ==========================================================
echo        KTA ERP ONE-CLICK PRODUCTION TEST LAUNCHER
echo ==========================================================
echo.
echo Target URLs:
echo   Backend:  https://kta-erp-backend-d7xj.onrender.com
echo   Frontend: https://frontend-liard-delta-44.vercel.app
echo.
echo Step 1/3: Waking up Render backend (cold-start ping)...
start https://kta-erp-backend-d7xj.onrender.com/actuator/health

echo Step 2/3: Opening interactive test runner in your browser...
timeout /t 2 >nul
start "" "%~dp0test_production.html"

echo Step 3/3: Running PowerShell backend test suite in console...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0verify_production.ps1"

echo.
echo ==========================================================
echo All steps initiated!
echo Press any key to open the live frontend login page...
pause >nul
start https://frontend-liard-delta-44.vercel.app/login
