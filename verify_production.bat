@echo off
title KTA ERP Production Links Verification
color 0b
echo ==========================================================
echo       KTA ERP PRODUCTION DEPLOYMENT TEST LAUNCHER
echo ==========================================================
echo Backend:  https://kta-erp-backend-d7xj.onrender.com
echo Frontend: https://frontend-liard-delta-44.vercel.app
echo ==========================================================
echo.
echo Launching automated PowerShell test suite...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0verify_production.ps1"

echo.
echo ==========================================================
echo Verification finished.
echo Press any key to open the interactive test dashboard in your browser...
pause >nul
start "" "%~dp0test_production.html"
