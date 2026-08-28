@echo off
title Sri Durga Enterprises - Database Backup Tool
color 0B

echo ===============================================================================
echo            SRI DURGA ENTERPRISES - AUTOMATIC DATABASE BACKUP
echo ===============================================================================
echo.

set "BACKUP_DIR=%~dp0Backups"
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Format Date & Time for timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "datetime=%%I"
set "TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%"

set "DB_FILE=%~dp0backend\data\sridurgadb.mv.db"
set "DEST_FILE=%BACKUP_DIR%\sridurgadb_backup_%TIMESTAMP%.mv.db"

if exist "%DB_FILE%" (
    copy /Y "%DB_FILE%" "%DEST_FILE%" >nul
    echo [SUCCESS] Backup created successfully!
    echo Location: %DEST_FILE%
) else (
    echo [WARNING] Database file not found at %DB_FILE%.
    echo The database will be created once the application is run for the first time.
)

echo.
echo ===============================================================================
echo Tip: You can copy the 'Backups' folder to a USB drive or secondary PC anytime.
echo ===============================================================================
echo.
pause
