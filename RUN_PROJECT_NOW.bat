@echo off
setlocal enabledelayedexpansion
title KTA ERP - Full Project Runner

echo ===============================================================================
echo                KUSHWAHA TENT AGENCY ERP - FULL PROJECT RUNNER
echo ===============================================================================
echo  Target: Hajipur, Vaishali, Bihar
echo  Strict No-Docker Native Windows Architecture
echo  Spring Boot 3.1.5 (Port 8080) + React 18 / Vite (Port 5173)
echo ===============================================================================
echo.

:: 1. Check Java 17+
java -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Java is not installed or not found in system PATH.
    echo Please install OpenJDK 17 or Oracle JDK 17 to run the backend.
    pause
    exit /b 1
)
echo [OK] Java detected.

:: 2. Check Node.js
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please install Node.js 18+ to run the frontend.
    pause
    exit /b 1
)
echo [OK] Node.js detected.

:: 3. Check for Maven
mvn -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Maven (mvn) command not found globally in PATH.
    echo If backend startup fails, ensure Apache Maven is added to your PATH.
) else (
    echo [OK] Maven detected.
)

:: 4. Verify Real Vyapar Excel File
if exist "data\Kushwaha_Tent_Agency_Vyapar_Data.xlsx" (
    echo [OK] Vyapar Excel Workbook verified at data\Kushwaha_Tent_Agency_Vyapar_Data.xlsx
) else if exist "Kushwaha_Tent_Agency_Vyapar_Data.xlsx" (
    echo [OK] Vyapar Excel Workbook verified in project root.
)

echo.
echo ===============================================================================
echo  STARTING APPLICATION SERVICES
echo ===============================================================================
echo.

:: Launch Backend
echo [1/2] Launching Spring Boot Backend in a separate window...
start "KTA ERP Backend (Port 8080)" cmd /k "cd /d "%~dp0backend" && mvn spring-boot:run -Dspring-boot.run.profiles=local"

echo Waiting 5 seconds for backend initialization...
timeout /t 5 /nobreak >nul

:: Launch Frontend
echo [2/2] Launching React Vite Frontend in a separate window...
start "KTA ERP Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Waiting 4 seconds for frontend dev server...
timeout /t 4 /nobreak >nul

:: Open browser automatically
echo.
echo Launching KTA ERP in your default browser...
start "" "http://localhost:5173"

echo.
echo ===============================================================================
echo                  KTA ERP IS NOW RUNNING!
echo ===============================================================================
echo  Frontend URL : http://localhost:5173
echo  Backend URL  : http://localhost:8080
echo.
echo  LOGIN CREDENTIALS:
echo    Username   : admin
echo    Password   : AdminPassword123!
echo.
echo  KEY REAL-DATA VIEWS:
echo    Dashboard  : http://localhost:5173/dashboard  (Sales, Collections, Godowns)
echo    Sales      : http://localhost:5173/sales      (178 Vyapar Sales Invoices)
echo    Customers  : http://localhost:5173/customers  (37 Parties Ledger Accounts)
echo    Excel UI   : http://localhost:5173/import-excel (Upload & Preview Workbook)
echo ===============================================================================
echo.
echo Keep the backend and frontend command windows open while working.
echo Press any key to open the interactive test & verification suite, or close this window.
pause >nul

start "" "test_vyapar_pipeline.html"
