@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo        KUSHWAHA TENT AGENCY ERP - VYAPAR REAL DATA PIPELINE & LAUNCHER
echo ===============================================================================
echo  Target: Hajipur, Vaishali, Bihar
echo  Strict No-Docker Native Windows Architecture
echo ===============================================================================
echo.

:: 1. Verify Java 17+
java -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Java is not installed or not in PATH. Please install OpenJDK 17+.
    pause
    exit /b 1
)
echo [OK] Java detected.

:: 2. Verify Node.js
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js 18+.
    pause
    exit /b 1
)
echo [OK] Node.js detected.

:: 3. Check for Vyapar Excel Workbook
if exist "data\Kushwaha_Tent_Agency_Vyapar_Data.xlsx" (
    echo [OK] Found Vyapar Data at data\Kushwaha_Tent_Agency_Vyapar_Data.xlsx
) else if exist "Kushwaha_Tent_Agency_Vyapar_Data.xlsx" (
    echo [OK] Found Vyapar Data in project root.
) else (
    echo [WARNING] Kushwaha_Tent_Agency_Vyapar_Data.xlsx not found in data\ folder.
)

echo.
echo -------------------------------------------------------------------------------
echo Select an action:
echo  [1] Start Backend (Spring Boot 3.1.5 with Apache POI)
echo  [2] Start Frontend (Vite + React 18 + Vyapar UI)
echo  [3] Run Frontend Typecheck & ESLint (Zero-warning check)
echo  [4] Run Both Backend & Frontend
echo  [5] Exit
echo -------------------------------------------------------------------------------
set /p choice="Enter choice (1-5): "

if "%choice%"=="1" goto run_backend
if "%choice%"=="2" goto run_frontend
if "%choice%"=="3" goto run_lint
if "%choice%"=="4" goto run_both
goto end

:run_backend
echo.
echo Starting Spring Boot Backend on http://localhost:8080...
cd backend
if exist "mvnw.cmd" (
    call mvnw.cmd spring-boot:run
) else (
    call mvn spring-boot:run
)
cd ..
goto end

:run_frontend
echo.
echo Starting Frontend on http://localhost:5173...
cd frontend
call npm run dev
cd ..
goto end

:run_lint
echo.
echo Running TypeScript and ESLint strict checks...
cd frontend
call npx tsc --noEmit
if %ERRORLEVEL% neq 0 (
    echo [FAIL] TypeScript compilation failed!
    cd ..
    pause
    exit /b 1
)
call npx eslint src --ext ts,tsx --max-warnings 0
if %ERRORLEVEL% neq 0 (
    echo [FAIL] ESLint warnings or errors found!
    cd ..
    pause
    exit /b 1
)
echo [SUCCESS] Frontend compilation and ESLint: 0 errors, 0 warnings!
cd ..
pause
goto end

:run_both
echo.
echo Launching Backend in new window...
start "KTA ERP Backend" cmd /k "cd backend && if exist mvnw.cmd (call mvnw.cmd spring-boot:run) else (call mvn spring-boot:run)"
timeout /t 5
echo Launching Frontend in new window...
start "KTA ERP Frontend" cmd /k "cd frontend && call npm run dev"
echo Both servers initiated!
goto end

:end
