@echo off
title Sri Durga Enterprises - Build Production App
color 0E

echo ===============================================================================
echo            SRI DURGA ENTERPRISES - 1-CLICK PRODUCTION COMPILER
echo ===============================================================================
echo.

echo 1. Building Optimized React 19 Frontend...
cd /d "%~dp0frontend"
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)

echo.
echo 2. Embedding Frontend into Spring Boot Static Resources...
if not exist "%~dp0backend\src\main\resources\static" mkdir "%~dp0backend\src\main\resources\static"
xcopy /E /Y /I "%~dp0frontend\dist\*" "%~dp0backend\src\main\resources\static\" >nul

echo.
echo 3. Packaging Unified Executable JAR (Spring Boot + Embedded Database + React)...
cd /d "%~dp0backend"
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Maven JAR packaging failed!
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo   [SUCCESS] Single-file Production App built successfully!
echo   Location: backend\target\sri-durga-backend-1.0.0.jar
echo.
echo   You can now launch the server anytime using: Run-Production-Server.bat
echo ===============================================================================
pause
