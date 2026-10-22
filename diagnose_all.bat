@echo off
echo ========================================
echo KTA ERP - Complete Diagnostic
echo ========================================
echo.

echo [1/5] Checking Prerequisites...
echo.
echo Java:
java -version 2>&1 | findstr "version"
echo.
echo Maven:
mvn -version 2>&1 | findstr "Maven"
echo.
echo Node.js:
node -v
echo.
echo PostgreSQL:
psql --version
echo.

echo [2/5] Checking Configuration Files...
echo.
if exist frontend\.env.local (
    echo [OK] frontend\.env.local exists
    type frontend\.env.local
) else (
    echo [MISSING] frontend\.env.local
)
echo.
if exist backend\src\main\resources\application-local.properties (
    echo [OK] backend application-local.properties exists
) else (
    echo [MISSING] backend application-local.properties
)
echo.

echo [3/5] Checking Ports...
echo.
echo Checking port 8080 (backend):
netstat -ano | findstr ":8080" >nul
if errorlevel 1 (
    echo [FREE] Port 8080 is available
) else (
    echo [IN USE] Port 8080 is already in use
    netstat -ano | findstr ":8080"
)
echo.
echo Checking port 5173 (frontend):
netstat -ano | findstr ":5173" >nul
if errorlevel 1 (
    echo [FREE] Port 5173 is available
) else (
    echo [IN USE] Port 5173 is already in use
    netstat -ano | findstr ":5173"
)
echo.

echo [4/5] Checking Database Connection...
echo.
psql -U kta_admin -d kta_erp_local -c "SELECT version();" 2>nul
if errorlevel 1 (
    echo [FAILED] Cannot connect to database
    echo Run setup_database.bat first
) else (
    echo [OK] Database connection successful
)
echo.

echo [5/5] Checking Frontend Dependencies...
echo.
if exist frontend\node_modules (
    echo [OK] node_modules exists
) else (
    echo [MISSING] node_modules - run: cd frontend && npm install
)
echo.

echo ========================================
echo Diagnostic Complete
echo ========================================
echo.
echo Next steps:
echo 1. Fix any MISSING or FAILED items above
echo 2. If ports are IN USE, close those applications
echo 3. Run START_PROJECT.bat again
echo.
pause
