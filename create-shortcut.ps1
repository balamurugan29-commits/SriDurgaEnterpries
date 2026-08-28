$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath 'Sri Durga Enterprises.lnk'
$targetExe = "D:\Our Company\Sri Durga Enterprises\dist-desktop\Sri Durga Enterprises-win32-x64\Sri Durga Enterprises.exe"
$workingDir = "D:\Our Company\Sri Durga Enterprises\dist-desktop\Sri Durga Enterprises-win32-x64"

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetExe
$shortcut.WorkingDirectory = $workingDir
$shortcut.Description = "Sri Durga Enterprises Billing & ERP System"
$shortcut.Save()

Write-Host "Desktop shortcut created at: $shortcutPath"
