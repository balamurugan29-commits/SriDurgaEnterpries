@echo off
title Sri Durga Enterprises - Client Desktop App
color 0B
echo ===============================================================================
echo                 SRI DURGA ENTERPRISES - CLIENT DESKTOP APPLICATION
echo ===============================================================================
echo.
echo Launching Sri Durga Enterprises User Interface...
echo.
cd /d "%~dp0frontend"
start "" "http://localhost:5173"
call npm.cmd run dev
