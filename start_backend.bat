@echo off
echo ========================================
echo Starting KTA ERP Backend
echo ========================================
cd backend
echo.
echo Building application...
call mvn clean package -DskipTests
if errorlevel 1 (
    echo.
    echo ERROR: Maven build failed!
    echo Make sure Maven and Java 17 are installed.
    pause
    exit /b 1
)
echo.
echo Starting Spring Boot with local profile...
echo Backend will be available at: http://localhost:8080
echo.
call mvn spring-boot:run -Dspring-boot.run.profiles=local
pause
