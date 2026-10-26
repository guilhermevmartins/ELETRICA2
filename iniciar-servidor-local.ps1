param(
    [Parameter(Mandatory=$true)][string]$PhpExe,
    [switch]$SmokeTest
)
$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$server = $null
$logPrefix = Join-Path ([IO.Path]::GetTempPath()) ('senai-local-' + [guid]::NewGuid().ToString('N'))
$errorLog = $logPrefix + '.error.log'
$outputLog = $logPrefix + '.output.log'
try {
    if (!(Test-Path -LiteralPath (Join-Path $projectRoot 'index.php'))) { throw 'index.php nao foi encontrado junto ao iniciador.' }
    $phpPath = (Get-Item -LiteralPath $PhpExe).FullName
    & $phpPath -v | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel executar o PHP.' }
    $port = $null
    foreach ($candidate in 8000..8020) {
        $listener = New-Object System.Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $candidate)
        try { $listener.Start(); $port = $candidate; break }
        catch [System.Net.Sockets.SocketException] { }
        finally { $listener.Stop() }
    }
    if ($null -eq $port) { throw 'Nenhuma porta local disponivel entre 8000 e 8020.' }
    $url = "http://127.0.0.1:$port/index.php"
    # O caminho entre aspas nao termina em barra: evita ambiguidades no PHP para Windows.
    $arguments = '-S 127.0.0.1:' + $port + ' -t "' + $projectRoot.TrimEnd('\') + '"'
    $server = Start-Process -FilePath $phpPath -ArgumentList $arguments -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardError $errorLog -RedirectStandardOutput $outputLog -PassThru
    Write-Host "Preparando o laboratorio na porta $port..."
    $ready = $false
    $deadline = [DateTime]::UtcNow.AddSeconds(30)
    while ([DateTime]::UtcNow -lt $deadline) {
        $server.Refresh()
        if ($server.HasExited) { throw 'O PHP encerrou antes de iniciar o site.' }
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2
            if ($response.StatusCode -eq 200) { $ready = $true; break }
        } catch { }
        Start-Sleep -Milliseconds 300
    }
    if (!$ready) { throw 'O servidor iniciou, mas a pagina nao respondeu dentro de 30 segundos.' }
    Write-Host "Servidor pronto: $url" -ForegroundColor Green
    if ($SmokeTest) { Write-Host 'TESTE OK: pagina respondeu HTTP 200.'; exit 0 }
    try { Start-Process $url } catch { Write-Host 'Nao foi possivel abrir o navegador. Copie o endereco acima.' }
    Write-Host 'Mantenha esta janela aberta. Pressione Ctrl+C para encerrar.'
    while (!$server.HasExited) { Start-Sleep -Milliseconds 500; $server.Refresh() }
    if ($server.ExitCode -ne 0) { throw "O PHP encerrou com codigo $($server.ExitCode)." }
} catch {
    Write-Host "Falha ao iniciar: $($_.Exception.Message)" -ForegroundColor Red
    if (Test-Path -LiteralPath $errorLog) { Get-Content -LiteralPath $errorLog -Tail 12 | Write-Host }
    Write-Host "Registro do PHP: $errorLog"
    exit 1
} finally {
    if ($null -ne $server) {
        $server.Refresh()
        if (!$server.HasExited) { Stop-Process -Id $server.Id -ErrorAction SilentlyContinue }
    }
}
