Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)
jarPath = scriptPath & "\backend\target\sri-durga-backend-1.0.0.jar"

' Look for portable Java 17 javaw.exe
javaExe = scriptPath & "\jdk-17\bin\javaw.exe"
If Not fso.FileExists(javaExe) Then
    javaExe = scriptPath & "\..\jdk-17\bin\javaw.exe"
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

' Run in backend working directory with low memory flags
cmd = """" & javaExe & """ -Xms64m -Xmx256m -XX:+UseSerialGC -jar """ & jarPath & """"
WshShell.CurrentDirectory = scriptPath & "\backend"
WshShell.Run cmd, 0, False

Set WshShell = Nothing
Set fso = Nothing
