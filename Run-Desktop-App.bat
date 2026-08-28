@echo off
title Sri Durga Enterprises - Desktop App Launcher
color 0A
if exist "%~dp0dist-desktop\Sri Durga Enterprises-win32-x64\Sri Durga Enterprises.exe" (
    start "" "%~dp0dist-desktop\Sri Durga Enterprises-win32-x64\Sri Durga Enterprises.exe"
) else (
    echo [INFO] Desktop EXE not yet compiled. Compiling now...
    call "%~dp0Build-Desktop-EXE.bat"
)
