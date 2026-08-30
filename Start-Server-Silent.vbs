Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)
batPath = scriptPath & "\Run-Production-Server.bat"

If fso.FileExists(batPath) Then
    WshShell.CurrentDirectory = scriptPath
    WshShell.Run """" & batPath & """", 0, False
End If

Set WshShell = Nothing
Set fso = Nothing
