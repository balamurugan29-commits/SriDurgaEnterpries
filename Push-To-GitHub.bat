@echo off
title Push Sri Durga Enterprises to GitHub
color 0B

echo ===============================================================================
echo            SRI DURGA ENTERPRISES - PUSH TO GITHUB MAIN
echo ===============================================================================
echo.

set "PATH=%~dp0..\git\cmd;%PATH%"
cd /d "%~dp0"

echo 1. Current Git Status:
git status -s
echo.

echo 2. Pushing to GitHub (origin main)...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ===============================================================================
    echo   [SUCCESS] Successfully pushed all changes to GitHub main branch!
    echo ===============================================================================
) else (
    echo.
    echo [NOTE] If GitHub asks for authentication:
    echo 1. Generate a Personal Access Token on GitHub (Settings -> Developer Settings -> Tokens)
    echo 2. Or enter your GitHub username and Personal Access Token as password.
)

echo.
pause
