@echo off
echo ========================================
echo EMERGENCY FIX - Run Frontend Only
echo ========================================
echo.
cd frontend
echo Current directory: %CD%
echo.

echo Checking Node.js installation...
where node
node -v
if errorlevel 1 (
    echo ERROR: Node.js not installed or not in PATH!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo.

echo Checking npm...
npm -v
if errorlevel 1 (
    echo ERROR: npm not found!
    pause
    exit /b 1
)
echo.

echo Checking .env.local...
if exist .env.local (
    echo Found .env.local:
    type .env.local
) else (
    echo Creating .env.local...
    echo VITE_API_BASE_URL=http://localhost:8080 > .env.local
    echo Created!
)
echo.

echo Checking node_modules...
if not exist node_modules (
    echo Installing dependencies... This will take a few minutes.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed!
        echo Try running: npm cache clean --force
        pause
        exit /b 1
    )
) else (
    echo node_modules found - OK
)
echo.

echo Checking package.json...
if not exist package.json (
    echo ERROR: package.json not found!
    echo Are you in the frontend directory?
    pause
    exit /b 1
)
echo.

echo Starting Vite dev server...
echo.
echo ========================================
echo The server will start below.
echo You should see: "Local: http://localhost:5173/"
echo.
echo If it fails, copy the ENTIRE error message.
echo ========================================
echo.

npm run dev

pause
