@echo off
echo ========================================
echo Pushing AdminBootstrap Fix to GitHub
echo ========================================
echo.
echo This fix will allow Render to properly read
echo ADMIN_USERNAME and ADMIN_PASSWORD environment variables.
echo.
pause

cd /d "%~dp0"
git push origin main

echo.
echo ========================================
echo Push Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Render will auto-deploy the new code (~3 minutes)
echo 2. Watch logs for "AdminBootstrap: Admin account created"
echo 3. Login at https://kta-phi.vercel.app/login
echo    Username: admin
echo    Password: AdminPassword123!
echo.
pause
