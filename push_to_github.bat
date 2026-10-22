@echo off
setlocal
title KTA ERP - Push to GitHub, Vercel & Render

echo ===============================================================================
echo        KTA ERP - PUSH ALL UPDATES TO GITHUB, VERCEL, AND RENDER
echo ===============================================================================
echo.
echo Local Git Status:
git status -sb
echo.
echo Commits ready to push to origin/main:
git log origin/main..HEAD --oneline
echo.
echo ===============================================================================
echo Pushing commits to GitHub (origin/main)...
echo ===============================================================================
echo.

git push origin main
if %ERRORLEVEL% equ 0 (
    echo.
    echo ===============================================================================
    echo [SUCCESS] All commits successfully pushed to GitHub!
    echo ===============================================================================
    echo.
    echo Automated cloud deployments have been triggered:
    echo.
    echo  1. VERCEL (Frontend):
    echo     URL: https://frontend-liard-delta-44.vercel.app
    echo     Auto-builds and deploys the latest frontend UI and Vyapar import screens.
    echo.
    echo  2. RENDER (Backend & Database):
    echo     URL: https://kta-erp-backend-d7xj.onrender.com
    echo     Auto-builds and runs database migrations (V8 Vyapar schema).
    echo.
    echo  3. GITHUB REPOSITORY:
    echo     URL: https://github.com/rajratanpcu/KTA
    echo.
    echo ===============================================================================
) else (
    echo.
    echo ===============================================================================
    echo [ERROR] Git push failed.
    echo Please check your internet connection or GitHub credentials.
    echo ===============================================================================
)

echo.
pause
