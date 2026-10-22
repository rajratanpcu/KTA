@echo off
echo ========================================
echo KTA ERP - Troubleshooting Frontend
echo ========================================
echo.

cd frontend

echo Step 1: Checking Node.js...
node -v
if errorlevel 1 (
    echo ERROR: Node.js not found!
    pause
    exit /b 1
)
echo.

echo Step 2: Checking if node_modules exists...
if not exist node_modules (
    echo node_modules not found - installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: npm install failed!
        pause
        exit /b 1
    )
) else (
    echo node_modules found
)
echo.

echo Step 3: Checking .env.local...
if exist .env.local (
    echo .env.local found:
    type .env.local
) else (
    echo Creating .env.local...
    echo VITE_API_BASE_URL=http://localhost:8080 > .env.local
)
echo.

echo Step 4: Checking package.json scripts...
findstr "dev" package.json
echo.

echo Step 5: Testing npm run dev...
echo This will start the dev server. Press Ctrl+C to stop.
echo.
pause
npm run dev
