@echo off
title Sri Durga Enterprises ERP Desktop
cd /d "%~dp0"

:: Start production server on 8085 if not already running
netstat -ano | findstr ":8085" >nul 2>&1
if %errorlevel% neq 0 (
    if exist "Start-Server-Silent.vbs" (
        wscript.exe "Start-Server-Silent.vbs"
    ) else (
        start /min "" "Run-Production-Server.bat"
    )
    timeout /t 3 /nobreak >nul
)

:: Find Chrome or Edge for Native Standalone App Window Mode (Frameless, dedicated desktop app)
set "APP_EXE="

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "APP_EXE=C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "APP_EXE=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    set "APP_EXE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) else if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    set "APP_EXE=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

if defined APP_EXE (
    start "" "%APP_EXE%" --app="http://localhost:8085" --window-size=1440,900 --user-data-dir="%LOCALAPPDATA%\SriDurgaERPApp"
) else (
    start "" "http://localhost:8085"
)
