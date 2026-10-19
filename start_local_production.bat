@echo off
title KTA ERP - Local Production Stack Launcher
echo ================================================================
echo           KTA ERP - Local Production Stack Launcher
echo ================================================================
echo Services:
echo   1. PostgreSQL 15 Container (Port 5432)
echo   2. Spring Boot 3 API Container (Port 8080)
echo   3. React 18 Nginx Frontend Container (Port 5173)
echo ================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Docker daemon status...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker Desktop is not running or not installed.
    echo Please start Docker Desktop and run this script again.
    pause
    exit /b 1
)

echo [2/3] Building and starting all containers via docker-compose...
docker-compose up --build -d

echo.
echo [3/3] Waiting for services to become healthy...
timeout /t 10 /nobreak >nul

echo.
echo ================================================================
echo   KTA ERP is now running locally!
echo ================================================================
echo   Frontend Application : http://localhost:5173
echo   Backend REST API     : http://localhost:8080/api
echo   Health Check         : http://localhost:8080/actuator/health
echo ================================================================
echo.
echo To view container logs at any time, run:
echo   docker-compose logs -f
echo.
echo To shut down all containers, run:
echo   docker-compose down
echo.
pause
