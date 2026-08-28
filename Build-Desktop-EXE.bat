@echo off
title Sri Durga Enterprises - Windows Desktop EXE Builder
color 0E
echo ===============================================================================
echo             SRI DURGA ENTERPRISES - STANDALONE WINDOWS EXE BUILDER
echo ===============================================================================
echo.
echo [1/2] Compiling React User Interface...
cd /d "%~dp0frontend"
call npm.cmd run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Packaging into Standalone Windows Executable (.exe)...
call npm.cmd run build:exe
if %errorlevel% neq 0 (
    echo [ERROR] EXE Packaging failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ===============================================================================
echo                 BUILD COMPLETE! YOUR WINDOWS EXE IS READY:
echo ===============================================================================
echo Location: dist-desktop\Sri Durga Enterprises-win32-x64\
echo File    : Sri Durga Enterprises.exe
echo.
explorer "%~dp0dist-desktop\Sri Durga Enterprises-win32-x64"
pause
