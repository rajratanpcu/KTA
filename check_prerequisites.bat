@echo off
echo ========================================
echo KTA ERP - Prerequisites Check
echo ========================================
echo.

echo Checking Java...
java -version 2>&1 | findstr /C:"version"
if errorlevel 1 (
    echo [X] Java NOT found - Install Java 17
) else (
    echo [OK] Java found
)
echo.

echo Checking Maven...
mvn -version 2>&1 | findstr /C:"Apache Maven"
if errorlevel 1 (
    echo [X] Maven NOT found - Install Maven 3.8+
) else (
    echo [OK] Maven found
)
echo.

echo Checking Node.js...
node -v 2>&1
if errorlevel 1 (
    echo [X] Node.js NOT found - Install Node.js 18+
) else (
    echo [OK] Node.js found
)
echo.

echo Checking PostgreSQL...
psql --version 2>&1 | findstr /C:"psql"
if errorlevel 1 (
    echo [X] PostgreSQL NOT found - Install PostgreSQL 15
) else (
    echo [OK] PostgreSQL found
)
echo.

echo ========================================
echo Prerequisites check complete!
echo ========================================
echo.
echo If any items are missing, install them before proceeding.
echo.
pause
