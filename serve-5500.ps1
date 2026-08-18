# Minimal static file server for erp-dien-mat-troi (port 5500)
$root = 'C:\Users\Administrator\Projects\erp-dien-mat-troi'
$port = 5500
$prefix = "http://127.0.0.1:$port/"

$mime = @{
  '.html'='text/html; charset=utf-8'
  '.htm'='text/html; charset=utf-8'
  '.js'='application/javascript; charset=utf-8'
  '.css'='text/css; charset=utf-8'
  '.json'='application/json; charset=utf-8'
  '.png'='image/png'
  '.jpg'='image/jpeg'
  '.jpeg'='image/jpeg'
  '.gif'='image/gif'
  '.webp'='image/webp'
  '.svg'='image/svg+xml'
  '.ico'='image/x-icon'
  '.woff'='font/woff'
  '.woff2'='font/woff2'
  '.map'='application/json'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
  $listener.Start()
} catch {
  Write-Host "FAILED to bind $prefix : $($_.Exception.Message)"
  exit 1
}
Write-Host "Serving $root at $prefix"
Write-Host "Open $prefix or ${prefix}index.html"

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response
  try {
    $rel = [Uri]::UnescapeDataString($req.Url.LocalPath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }
    $rel = $rel -replace '/', '\'
    if ($rel.Contains('..')) {
      $res.StatusCode = 400
      $bytes = [Text.Encoding]::UTF8.GetBytes('Bad path')
      $res.OutputStream.Write($bytes,0,$bytes.Length)
      $res.Close()
      continue
    }
    $path = Join-Path $root $rel
    if ((Test-Path $path -PathType Container)) {
      $path = Join-Path $path 'index.html'
    }
    if (-not (Test-Path $path -PathType Leaf)) {
      $res.StatusCode = 404
      $bytes = [Text.Encoding]::UTF8.GetBytes("Not found: $rel")
      $res.ContentType = 'text/plain; charset=utf-8'
      $res.OutputStream.Write($bytes,0,$bytes.Length)
      $res.Close()
      continue
    }
    $ext = [IO.Path]::GetExtension($path).ToLowerInvariant()
    $res.ContentType = $(if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' })
    $bytes = [IO.File]::ReadAllBytes($path)
    $res.ContentLength64 = $bytes.LongLength
    $res.AddHeader('Cache-Control','no-cache')
    $res.OutputStream.Write($bytes,0,$bytes.Length)
    $res.Close()
    Write-Host ("{0} {1}" -f $req.HttpMethod, $rel)
  } catch {
    try {
      $res.StatusCode = 500
      $msg = [Text.Encoding]::UTF8.GetBytes($_.Exception.Message)
      $res.OutputStream.Write($msg,0,$msg.Length)
      $res.Close()
    } catch {}
    Write-Host "ERR $($_.Exception.Message)"
  }
}
