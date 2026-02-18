# ============================================================
# Servidor HTTP Local - Cocal Bolsas de Estudos
# Apenas localhost:8090 - nao expoe na rede
# ============================================================

$porta = 8090
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$porta/")

try {
    $listener.Start()
}
catch {
    Write-Host "Porta $porta ocupada. Encerrando."
    exit
}

Write-Host "Servidor rodando em http://localhost:$porta"
Write-Host "Pasta: $raiz"
Write-Host "Pressione Ctrl+C para encerrar."

$mimeTypes = @{
    '.html'  = 'text/html; charset=utf-8'
    '.css'   = 'text/css; charset=utf-8'
    '.js'    = 'application/javascript; charset=utf-8'
    '.json'  = 'application/json; charset=utf-8'
    '.png'   = 'image/png'
    '.jpg'   = 'image/jpeg'
    '.jpeg'  = 'image/jpeg'
    '.gif'   = 'image/gif'
    '.svg'   = 'image/svg+xml'
    '.ico'   = 'image/x-icon'
    '.xlsx'  = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    '.xls'   = 'application/vnd.ms-excel'
    '.woff'  = 'font/woff'
    '.woff2' = 'font/woff2'
    '.ttf'   = 'font/ttf'
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        
        # Processa cada request em um bloco try separado para nao derrubar o servidor se houver erro no envio
        try {
            $request = $context.Request
            $response = $context.Response

            $caminho = $request.Url.LocalPath
            if ($caminho -eq '/') { $caminho = '/index.html' }

            $arquivo = Join-Path $raiz ($caminho -replace '/', '\')

            if (Test-Path $arquivo -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($arquivo).ToLower()
                $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }

                $response.ContentType = $contentType
                $response.Headers.Add('Access-Control-Allow-Origin', '*')
                $response.StatusCode = 200

                # Abre o arquivo permitindo leitura mesmo se estiver aberto no Excel
                $fs = New-Object System.IO.FileStream($arquivo, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
                try {
                    $contentLength = $fs.Length
                    $bytes = New-Object byte[]($contentLength)
                    $fs.Read($bytes, 0, $contentLength)
                    $response.ContentLength64 = $contentLength
                    $response.OutputStream.Write($bytes, 0, $contentLength)
                }
                finally {
                    $fs.Close()
                }
            }
            else {
                $response.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes('404 - Arquivo nao encontrado')
                $response.OutputStream.Write($msg, 0, $msg.Length)
            }
            $response.OutputStream.Close()
        }
        catch {
            # Erro em uma request especifica (ex: cancelamento pelo navegador)
            # Nao faz nada aqui, apenas garante que o loop continue
        }
    }
    catch {
        # Erro critico ao obter o contexto (ex: listener parado)
        if ($listener.IsListening) { Start-Sleep -Milliseconds 100 }
        else { break }
    }
}
