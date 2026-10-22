@echo off
echo ========================================
echo KTA ERP - Troubleshooting Login Issue
echo ========================================
echo.
echo Check Backend Logs:
echo.
echo 1. Go to https://dashboard.render.com
echo 2. Click on "kta-erp-backend" service
echo 3. Click "Logs" tab
echo 4. Search for "AdminBootstrap"
echo.
echo You should see one of these:
echo   - "Admin account provisioned successfully"
echo   - "Admin account already exists, password updated"
echo   - "ADMIN_PASSWORD must be at least 12 characters"
echo.
echo If you don't see any AdminBootstrap message:
echo   - The ADMIN_USERNAME or ADMIN_PASSWORD env vars are missing
echo.
echo Current expected credentials:
echo   Username: admin
echo   Password: AdminPassword123!
echo.
echo ========================================
echo Alternative: Check Environment Variables
echo ========================================
echo.
echo 1. In the backend service, click "Environment" tab
echo 2. Verify these exist:
echo    - ADMIN_USERNAME = admin
echo    - ADMIN_PASSWORD = AdminPassword123!
echo.
echo If missing, add them and redeploy.
echo.
pause
