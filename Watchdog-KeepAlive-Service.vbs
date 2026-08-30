' Sri Durga Enterprises ERP - 24/7 Watchdog & Keep-Alive Daemon
' Runs silently in the background, prevents system sleep while server is active,
' and automatically restarts backend & database if ever interrupted.

Option Explicit
Dim WshShell, http, fso, scriptDir, pingUrl, failCount, javaExe, jarPath, cmd

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
pingUrl = "http://localhost:8085/api/auth/ping"
failCount = 0

' Determine Java 17 and JAR paths
jarPath = scriptDir & "\backend\target\sri-durga-backend-1.0.0.jar"
If Not fso.FileExists(jarPath) Then
    jarPath = "C:\SriDurgaERP\backend\target\sri-durga-backend-1.0.0.jar"
End If

javaExe = scriptDir & "\jdk-17\bin\javaw.exe"
If Not fso.FileExists(javaExe) Then
    javaExe = scriptDir & "\..\jdk-17\bin\javaw.exe"
End If
If Not fso.FileExists(javaExe) Then
    javaExe = "E:\office\jdk-17\bin\javaw.exe"
End If
If Not fso.FileExists(javaExe) Then
    javaExe = "C:\SriDurgaERP\jdk-17\bin\javaw.exe"
End If
If Not fso.FileExists(javaExe) Then
    javaExe = "javaw.exe"
End If

Function IsServerAlive()
    On Error Resume Next
    Dim req
    Set req = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    req.setTimeouts 2000, 2000, 2000, 2000
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
    If fso.FileExists(jarPath) Then
        cmd = """" & javaExe & """ -Xms64m -Xmx256m -XX:+UseSerialGC -jar """ & jarPath & """"
        WshShell.CurrentDirectory = fso.GetParentFolderName(jarPath) & "\.."
        WshShell.Run cmd, 0, False
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
            WScript.Sleep 5000
        End If
    Else
        failCount = 0
    End If
Loop
