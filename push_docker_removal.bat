@echo off
echo ========================================
echo KTA ERP - Pushing Docker Removal
echo ========================================
echo.
echo Pushing changes to GitHub...
cd /d "%~dp0"
git push origin main
echo.
echo ========================================
echo Changes pushed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Your backend on Render will need to be redeployed
echo 2. Go to https://dashboard.render.com
echo 3. Click on "kta-backend" service
echo 4. Click "Manual Deploy" - "Clear build cache & deploy"
echo.
echo The service will rebuild using native Java instead of Docker.
echo.
pause
