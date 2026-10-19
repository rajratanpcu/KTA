@echo off
echo ========================================
echo KTA ERP - Backend Verification
echo ========================================
echo.
echo Backend URL: https://kta-ow3x.onrender.com
echo.
echo Testing health endpoint...
curl -s https://kta-ow3x.onrender.com/actuator/health
echo.
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Go to https://vercel.com/dashboard
echo 2. Open your "kta2" project
echo 3. Go to Settings -^> Environment Variables
echo 4. Find VITE_API_BASE_URL
echo 5. Change it to: https://kta-ow3x.onrender.com
echo 6. Go to Deployments tab
echo 7. Click the ... menu on latest deployment
echo 8. Click "Redeploy"
echo.
echo After redeploy completes, test at:
echo https://kta2.vercel.app/login
echo.
echo Credentials:
echo   Username: admin
echo   Password: AdminPassword123!
echo.
pause
