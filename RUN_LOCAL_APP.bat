@echo off
setlocal enabledelayedexpansion
title KTA ERP - Local Launcher (No Docker)
color 0A

echo ================================================================
echo           KTA ERP - Native Local Launcher (Zero Docker)
echo ================================================================
echo.

cd /d "%~dp0"

:: 1. Check Prerequisites
echo [1/4] Checking prerequisites...

where node >nul 2>&1
if errorlevel 1 (
    color 0C
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo  - Node.js: OK

where java >nul 2>&1
if errorlevel 1 (
    color 0C
    echo [ERROR] Java is not installed or not in PATH!
    echo Please install Java 17+ from https://adoptium.net
    pause
    exit /b 1
)
echo  - Java Runtime: OK

where mvn >nul 2>&1
if errorlevel 1 (
    echo  - Maven: Not found in PATH (Will use direct Java launcher)
    set USE_MAVEN=0
) else (
    echo  - Maven: OK
    set USE_MAVEN=1
)
echo.

:: 2. Choose Database Mode
echo ================================================================
echo [2/4] Choose Database Mode:
echo ================================================================
echo  [1] Cloud Database (Render Postgres) - Recommended, ZERO local setup!
echo  [2] Local Database (Localhost:5432 - Requires local PostgreSQL running)
echo.
set /p DB_CHOICE="Enter choice [1 or 2, default is 1]: "

if "%DB_CHOICE%"=="2" (
    set SPRING_PROFILE=local
    echo  - Mode: Local Database (localhost:5432/kta_erp_local)
) else (
    set SPRING_PROFILE=cloud
    echo  - Mode: Cloud Database (Render PostgreSQL)
)
echo.

:: 3. Configure Frontend Local API URL
echo [3/4] Configuring frontend environment...
cd frontend
echo VITE_API_BASE_URL=http://localhost:8080 > .env.local
if not exist node_modules (
    echo Installing frontend dependencies (one-time setup)...
    call npm install
)
cd ..
echo  - Frontend .env.local configured: http://localhost:8080
echo.

:: 4. Launch Backend in New Window
echo [4/4] Starting servers...
echo Starting Backend server (Spring Boot)...

if "%USE_MAVEN%"=="1" (
    start "KTA Backend (Spring Boot)" cmd /k "cd /d "%~dp0backend" && title KTA Backend && echo Starting KTA Backend with profile: %SPRING_PROFILE%... && mvn spring-boot:run -Dspring-boot.run.profiles=%SPRING_PROFILE%"
) else (
    if exist "backend\target\kta-erp-1.0.0.jar" (
        start "KTA Backend (Spring Boot)" cmd /k "cd /d "%~dp0backend" && title KTA Backend && echo Starting KTA Backend JAR with profile: %SPRING_PROFILE%... && java -jar target\kta-erp-1.0.0.jar --spring.profiles.active=%SPRING_PROFILE%"
    ) else (
        echo [ERROR] Maven is not installed and backend\target\kta-erp-1.0.0.jar was not found!
        echo Please install Maven or build the JAR first.
        pause
        exit /b 1
    )
)

:: 5. Launch Frontend in New Window
echo Starting Frontend server (Vite React)...
start "KTA Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && title KTA Frontend && echo Starting Vite development server... && npm run dev"

echo.
echo ================================================================
echo           KTA ERP is starting up!
echo ================================================================
echo.
echo Waiting 8 seconds for servers to initialize...
timeout /t 8 /nobreak >nul

echo Opening browser at http://localhost:5173/login ...
start http://localhost:5173/login

echo.
echo ================================================================
echo Access Information:
echo ================================================================
echo   Frontend UI : http://localhost:5173
echo   Backend API : http://localhost:8080/api
echo   Health Check: http://localhost:8080/actuator/health
echo.
echo Login Credentials:
echo   Username: admin
echo   Password: AdminPassword123!
echo ================================================================
echo.
echo Keep the two server windows open while using KTA ERP.
echo To stop the application, simply close both server windows.
echo.
pause
