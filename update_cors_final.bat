@echo off
echo ========================================
echo KTA ERP - Update Backend CORS
echo ========================================
echo.
echo Frontend URL: https://frontend-liard-delta-44.vercel.app
echo Backend URL:  https://kta-erp-backend-d7xj.onrender.com
echo.
echo Steps to connect them:
echo.
echo 1. Go to https://dashboard.render.com
echo 2. Click on "kta-erp-backend" service
echo 3. Click "Environment" tab
echo 4. Find CORS_ALLOWED_ORIGINS
echo 5. Click Edit (pencil icon)
echo 6. Change value to: https://frontend-liard-delta-44.vercel.app,https://kta-phi.vercel.app
echo 7. Click Save Changes
echo.
echo The service will redeploy (~2 minutes).
echo.
echo After that, test at: https://frontend-liard-delta-44.vercel.app/login
echo.
echo Login credentials:
echo   Username: admin
echo   Password: AdminPassword123!
echo.
pause
