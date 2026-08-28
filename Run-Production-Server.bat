@echo off
title Sri Durga Enterprises - Ultra-Lightweight Production Server
color 0A

echo ===============================================================================
echo            SRI DURGA ENTERPRISES - CENTRAL PRODUCTION SERVER
echo                   (Ultra-Low Memory Mode: 250MB RAM)
echo ===============================================================================
echo.

:: Get Local IPv4 Address
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0.*0.0.0.0 ^| findstr /v "Default"') do set "LOCAL_IP=%%a" & goto :found_ip
:found_ip

echo [STATUS] Main Server is starting...
echo          ============================================================
echo          LOCAL SERVER URL  : http://localhost:8085
echo          STAFF LAN ACCESS  : http://%LOCAL_IP%:8085
echo          EMBEDDED DATABASE : Active (High-Performance H2 File DB)
echo          ============================================================
echo.
echo Staff members on the office Wi-Fi can open: http://%LOCAL_IP%:8085
echo.

:: Check if port 8085 is already running
netstat -ano | findstr ":8085" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Sri Durga ERP Server is ALREADY ACTIVE and RUNNING on port 8085!
    echo        Local URL : http://localhost:8085
    echo        Staff URL : http://%LOCAL_IP%:8085
    echo.
    exit /b 0
)

:: Check Java 17
set "JAVA_CMD=java"
if exist "%~dp0jdk-17\bin\java.exe" set "JAVA_CMD=%~dp0jdk-17\bin\java.exe"
if exist "%~dp0..\jdk-17\bin\java.exe" set "JAVA_CMD=%~dp0..\jdk-17\bin\java.exe"
if exist "E:\office\jdk-17\bin\java.exe" set "JAVA_CMD=E:\office\jdk-17\bin\java.exe"
if exist "C:\SriDurgaERP\jdk-17\bin\java.exe" set "JAVA_CMD=C:\SriDurgaERP\jdk-17\bin\java.exe"

"%JAVA_CMD%" -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java 17 is not found! Please install Java 17 or place jdk-17 folder here.
    pause
    exit /b 1
)

:: Launch JAR with constrained memory
cd /d "%~dp0backend"
if exist "target\sri-durga-backend-1.0.0.jar" (
    "%JAVA_CMD%" -Xms64m -Xmx256m -XX:+UseSerialGC -jar target\sri-durga-backend-1.0.0.jar
) else (
    echo [ERROR] Application JAR not found in backend\target!
    echo Please run Build-Production-App.bat first.
    pause
)
