@echo off
echo ========================================
echo Starting KTA ERP Frontend
echo ========================================
cd frontend
echo.
echo Checking .env.local configuration...
if not exist .env.local (
    echo VITE_API_BASE_URL=http://localhost:8080 > .env.local
    echo Created .env.local
)
echo.
echo Starting Vite dev server...
echo Frontend will be available at: http://localhost:5173
echo.
npm run dev
pause
