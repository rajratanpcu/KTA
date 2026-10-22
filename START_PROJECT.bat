@echo off
echo ========================================
echo KTA ERP - Quick Start
echo ========================================
echo.
echo This will start both frontend and backend.
echo Make sure the database is set up first!
echo.
echo Step 1: Setup database (run once)
echo Step 2: Start backend
echo Step 3: Start frontend
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause

echo.
echo Opening backend in new window...
start "KTA Backend" cmd /k start_backend.bat

echo Waiting 10 seconds for backend to initialize...
timeout /t 10 /nobreak

echo.
echo Opening frontend in new window...
start "KTA Frontend" cmd /k start_frontend.bat

echo.
echo ========================================
echo Both services are starting!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8080
echo.
echo Login credentials:
echo   Username: admin
echo   Password: AdminPassword123!
echo.
echo Close this window when done.
pause
