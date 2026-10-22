@echo off
setlocal

echo ===============================================================================
echo                KTA ERP - PUSH LATEST COMMITS TO GITHUB
echo ===============================================================================
echo.
echo Pushing local branch 'main' to origin/main on GitHub...
echo.

git status -sb
echo.

git push origin main
if %ERRORLEVEL% equ 0 (
    echo.
    echo ===============================================================================
    echo [SUCCESS] Successfully pushed all commits to GitHub!
    echo Vercel and Render automated builds will trigger automatically.
    echo ===============================================================================
) else (
    echo.
    echo ===============================================================================
    echo [ERROR] Git push failed. Please check your internet connection or git credentials.
    echo ===============================================================================
)

echo.
pause
