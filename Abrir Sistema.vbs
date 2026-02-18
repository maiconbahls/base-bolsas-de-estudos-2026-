Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strPasta = fso.GetParentFolderName(WScript.ScriptFullName)
strServidor = strPasta & "\servidor.ps1"

' Inicia o servidor PowerShell em segundo plano (janela oculta)
WshShell.Run "powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & strServidor & """", 0, False

' Aguarda o servidor iniciar
WScript.Sleep 1500

' Abre no navegador padrao
WshShell.Run "http://localhost:8090", 1, False
