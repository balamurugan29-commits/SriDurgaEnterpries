@echo off
title Sri Durga Enterprises - Auto Installer and Security Registrar
color 0B
echo ===============================================================================
echo            SRI DURGA ENTERPRISES - PC SETUP ^& SECURITY REGISTRAR
echo ===============================================================================
echo.
echo [1/4] Registering Sri Durga Enterprises Verified Publisher Certificate...
if exist "%~dp0SriDurgaEnterprises.cer" (
    certutil -addstore -f "TrustedPublisher" "%~dp0SriDurgaEnterprises.cer" >nul 2>&1
    certutil -addstore -f "Root" "%~dp0SriDurgaEnterprises.cer" >nul 2>&1
    echo       [OK] Security Certificate registered in Windows Trusted Store.
) else (
    echo       [WARNING] Certificate file not found, skipping certificate register.
)

echo.
echo [2/4] Unblocking Application Executables from Windows SmartScreen...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path '%~dp0' -Recurse | Unblock-File" >nul 2>&1
echo       [OK] Files unblocked successfully.

echo.
echo [3/4] Creating Native Desktop Shortcut on Windows Desktop...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Sri Durga Enterprises.lnk'); $Shortcut.TargetPath = '%~dp0Launch-Sri-Durga-App.vbs'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Description = 'Sri Durga Enterprises Billing & ERP System'; $Shortcut.IconLocation = '%~dp0frontend\public\logo.jpg'; $Shortcut.Save()"
echo       [OK] 'Sri Durga Enterprises' shortcut created on your Desktop.

echo.
echo [4/4] Launching Sri Durga Enterprises Desktop Application...
start "" "%~dp0Launch-Sri-Durga-App.vbs"

echo.
echo ===============================================================================
echo             SETUP COMPLETE! APPLICATION IS NOW READY TO USE
echo ===============================================================================
timeout /t 3 >nul
exit /b 0
