@echo off
title Sri Durga Enterprises - Desktop Shortcut Creator
color 0A
echo ===============================================================================
echo            SRI DURGA ENTERPRISES - DESKTOP SHORTCUT INSTALLER
echo ===============================================================================
echo.
echo Creating official 'Sri Durga Enterprises' desktop icon on your Windows Desktop...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Sri Durga Enterprises.lnk'); $Shortcut.TargetPath = '%~dp0Launch-Sri-Durga-App.vbs'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Description = 'Sri Durga Enterprises Billing & ERP Software'; $Shortcut.Save()"

if %errorlevel% equ 0 (
    echo [SUCCESS] 'Sri Durga Enterprises' Desktop Shortcut created successfully!
    echo You can now launch Sri Durga Enterprises directly from your Desktop anytime.
) else (
    echo [ERROR] Could not create desktop shortcut.
)

echo.
timeout /t 3 >nul
exit /b 0
