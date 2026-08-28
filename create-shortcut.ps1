$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath 'Sri Durga Enterprises.lnk'
$targetExe = "$PSScriptRoot\Launch-Sri-Durga-App.vbs"
$workingDir = "$PSScriptRoot"
$iconFile = "$PSScriptRoot\logo.ico"

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetExe
$shortcut.WorkingDirectory = $workingDir
$shortcut.Description = "Sri Durga Enterprises Billing & ERP Software"
if (Test-Path $iconFile) {
    $shortcut.IconLocation = "$iconFile,0"
}
$shortcut.Save()

Write-Host "Desktop application shortcut created at: $shortcutPath"
