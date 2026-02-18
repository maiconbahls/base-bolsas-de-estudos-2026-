
# Fix mojibake in a file
function Fix-Mojibake {
    param([string]$FilePath)
    $content = Get-Content $FilePath -Raw -Encoding UTF8
    
    # Common UTF-8 mojibake patterns
    $replacements = @{
        "Ã¡" = "á"; "Ã¢" = "â"; "Ã£" = "ã"; "Ã§" = "ç";
        "Ã©" = "é"; "Ãª" = "ê"; "Ã" = "í"; "Ã³" = "ó";
        "Ã´" = "ô"; "Ãµ" = "õ"; "Ãº" = "ú"; "Ã¼" = "ü";
        "Ã€" = "À"; "Ã‚" = "Â"; "Ãƒ" = "Ã"; "Ã‡" = "Ç";
        "Ã‰" = "É"; "ÃŠ" = "Ê"; "ÃÍ" = "Í"; "Ã“" = "Ó";
        "Ã”" = "Ô"; "Ã•" = "Õ"; "Ãš" = "Ú"; "Ãœ" = "Ü";
        "Ã±" = "ñ"; "ÃÑ" = "Ñ"; "Ãº" = "ú"; "Â" = ""; # generic garbage sometimes
        "Ã " = "à"; 
    }

    # Better approach: decode strings (Double UTF-8 fix)
    # But simple replace is safer for specific known bad patterns.
    # Actually, let's try to interpret bytes as Latin1 then decode as UTF-8?
    # No, let's do search/replace for the common Portuguese ones.
    
    $fixed = $content
    $fixed = $fixed -replace "Ã¡", "á"
    $fixed = $fixed -replace "Ã¢", "â"
    $fixed = $fixed -replace "Ã£", "ã"
    $fixed = $fixed -replace "Ã§", "ç"
    $fixed = $fixed -replace "Ã©", "é"
    $fixed = $fixed -replace "Ãª", "ê"
    $fixed = $fixed -replace "Ãí", "í"
    $fixed = $fixed -replace "Ã³", "ó"
    $fixed = $fixed -replace "Ã´", "ô"
    $fixed = $fixed -replace "Ãµ", "õ"
    $fixed = $fixed -replace "Ãº", "ú"
    $fixed = $fixed -replace "Ã¼", "ü"
    $fixed = $fixed -replace "Ã€", "À"
    $fixed = $fixed -replace "Ã‚", "Â"
    $fixed = $fixed -replace "Ãƒ", "Ã"
    $fixed = $fixed -replace "Ã‡", "Ç"
    $fixed = $fixed -replace "Ã‰", "É"
    $fixed = $fixed -replace "ÃŠ", "Ê"
    $fixed = $fixed -replace "ÃÍ", "Í"
    $fixed = $fixed -replace "Ã“", "Ó"
    $fixed = $fixed -replace "Ã”", "Ô"
    $fixed = $fixed -replace "Ã•", "Õ"
    $fixed = $fixed -replace "Ãš", "Ú"
    $fixed = $fixed -replace "Ãœ", "Ü"
    $fixed = $fixed -replace "Ã±", "ñ"
    $fixed = $fixed -replace "Ã ", "à"
    
    # Specific ones seen in screenshots
    $fixed = $fixed -replace "Ã§Ã£o", "ção"
    $fixed = $fixed -replace "Ãµes", "ões"
    $fixed = $fixed -replace "Ãªn", "ên"
    $fixed = $fixed -replace "Ã¡", "á"
    
    # Edge case: "Ã" followed by obscure char for 'í'. usually "í" is C3 AD. 
    # In Windows-1252, C3 is "Ã", AD is soft hyphen (invisible or '-').
    # Let's handle generic "Ã" followed by non-mapped chars? No, risky.
    
    Set-Content -Path $FilePath -Value $fixed -Encoding UTF8
    Write-Host "Fixed encoding in $FilePath"
}

$root = "c:\Users\maicon.bahls\Cocal\Recursos Humanos - PRIVADO\PROGRAMAS - MAICON\PHYTON\SISTEMA_BOLSAS_DEESTUDOS"
Fix-Mojibake "$root\index.html"
Fix-Mojibake "$root\js\app.js"
Fix-Mojibake "$root\css\styles.css"
