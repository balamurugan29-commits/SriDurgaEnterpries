' Sri Durga Enterprises ERP - 24/7 Watchdog & Keep-Alive Daemon
' Runs silently in the background, prevents system sleep while server is active,
' and automatically restarts backend & database if ever interrupted.

Option Explicit
Dim WshShell, fso, scriptDir, pingUrl, failCount, batPath

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
pingUrl = "http://localhost:8085/api/auth/ping"
batPath = scriptDir & "\Run-Production-Server.bat"
failCount = 0

Function IsServerAlive()
    On Error Resume Next
    Dim req
    Set req = CreateObject("WinHttp.WinHttpRequest.5.1")
    req.SetTimeouts 1500, 1500, 1500, 1500
    req.Open "GET", pingUrl, False
    req.Send
    If Err.Number = 0 And req.Status = 200 Then
        IsServerAlive = True
    Else
        IsServerAlive = False
    End If
    Set req = Nothing
    On Error GoTo 0
End Function

Sub StartBackendServer()
    If fso.FileExists(batPath) Then
        WshShell.CurrentDirectory = scriptDir
        WshShell.Run """" & batPath & """", 0, False
    End If
End Sub

' Initial check on watchdog startup
If Not IsServerAlive() Then
    StartBackendServer()
End If

' 24/7 Watchdog Loop
Do While True
    WScript.Sleep 10000 ' Check every 10 seconds
    
    If Not IsServerAlive() Then
        failCount = failCount + 1
        If failCount >= 2 Then
            ' Server has been down for 20 seconds -> Self-heal and restart backend
            StartBackendServer()
            failCount = 0
            WScript.Sleep 10000
        End If
    Else
        failCount = 0
    End If
Loop
