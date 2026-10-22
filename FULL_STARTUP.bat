@echo off
echo ========================================
echo KTA ERP - FULL STARTUP WITH DIAGNOSTICS
echo ========================================
echo.

echo Step 1: Running full diagnostic...
call diagnose_all.bat
echo.

echo ========================================
echo Do you want to continue with startup?
echo ========================================
pause

echo.
echo Step 2: Starting Backend...
echo.
cd backend
echo Building backend (this may take 1-2 minutes)...
call mvn clean package -DskipTests
if errorlevel 1 (
    echo.
    echo ERROR: Backend build failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo Starting backend server in new window...
start "KTA Backend Server" cmd /k "mvn spring-boot:run -Dspring-boot.run.profiles=local"

cd..

echo.
echo Waiting 20 seconds for backend to start...
timeout /t 20 /nobreak

echo.
echo Step 3: Verifying backend is running...
curl -s http://localhost:8080/actuator/health >nul 2>&1
if errorlevel 1 (
    echo WARNING: Backend health check failed
    echo Check the Backend Server window for errors
    echo Press any key to try starting frontend anyway...
    pause
) else (
    echo SUCCESS: Backend is running!
)

echo.
echo Step 4: Starting Frontend...
echo.
cd frontend

echo Verifying npm...
npm -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm not found!
    pause
    exit /b 1
)

echo Checking dependencies...
if not exist node_modules (
    echo Installing dependencies (first time only)...
    npm install
)

echo.
echo Starting frontend server in new window...
start "KTA Frontend Server" cmd /k "npm run dev"

cd..

echo.
echo ========================================
echo STARTUP COMPLETE
echo ========================================
echo.
echo Check the two new windows that opened:
echo 1. KTA Backend Server - should show "Started KtaErpApplication"
echo 2. KTA Frontend Server - should show "Local: http://localhost:5173"
echo.
echo Wait 10 seconds, then open: http://localhost:5173/login
echo.
echo Login: admin / AdminPassword123!
echo.
echo If you see errors in those windows, copy them and report back.
echo.
pause
