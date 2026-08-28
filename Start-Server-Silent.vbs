Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptPath
WshShell.Run chr(34) & scriptPath & "\Run-Production-Server.bat" & Chr(34), 0, False
Set WshShell = Nothing
