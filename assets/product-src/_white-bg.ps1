#Requires -Version 5.1
param(
  [Parameter(Mandatory=$true)][string]$In,
  [Parameter(Mandatory=$true)][string]$Out,
  [int]$Tol = 40
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$loaded = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $In).Path)
$bmp = New-Object System.Drawing.Bitmap $loaded
$loaded.Dispose()
$imgW = [int]$bmp.Width
$imgH = [int]$bmp.Height
$rect = New-Object System.Drawing.Rectangle 0, 0, $imgW, $imgH
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = [int]$data.Stride
$bytes = New-Object byte[] ($stride * $imgH)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

$cr = [int]$bytes[2]; $cg = [int]$bytes[1]; $cb = [int]$bytes[0]
$seen = New-Object 'bool[]' ($imgW * $imgH)
$qx = New-Object 'System.Collections.Generic.Queue[int]'
$qy = New-Object 'System.Collections.Generic.Queue[int]'

$edgeX = New-Object int[] ($imgW * 2 + $imgH * 2)
$edgeY = New-Object int[] ($imgW * 2 + $imgH * 2)
$ec = 0
for ($x = 0; $x -lt $imgW; $x++) {
  $edgeX[$ec] = $x; $edgeY[$ec] = 0; $ec++
  $edgeX[$ec] = $x; $edgeY[$ec] = ($imgH - 1); $ec++
}
for ($y = 0; $y -lt $imgH; $y++) {
  $edgeX[$ec] = 0; $edgeY[$ec] = $y; $ec++
  $edgeX[$ec] = ($imgW - 1); $edgeY[$ec] = $y; $ec++
}
for ($e = 0; $e -lt $ec; $e++) {
  $x = $edgeX[$e]; $y = $edgeY[$e]
  $i = $y * $stride + $x * 4
  $r = [int]$bytes[$i + 2]; $g = [int]$bytes[$i + 1]; $b = [int]$bytes[$i]
  if ([Math]::Abs($r - $cr) -gt $Tol) { continue }
  if ([Math]::Abs($g - $cg) -gt $Tol) { continue }
  if ([Math]::Abs($b - $cb) -gt $Tol) { continue }
  $id = $y * $imgW + $x
  if ($seen[$id]) { continue }
  $seen[$id] = $true
  $qx.Enqueue($x); $qy.Enqueue($y)
}

$dx = @( -1, 1, 0, 0 )
$dy = @( 0, 0, -1, 1 )
while ($qx.Count -gt 0) {
  $x = $qx.Dequeue()
  $y = $qy.Dequeue()
  $i = $y * $stride + $x * 4
  $bytes[$i] = 255; $bytes[$i + 1] = 255; $bytes[$i + 2] = 255; $bytes[$i + 3] = 255
  for ($k = 0; $k -lt 4; $k++) {
    $nx = $x + $dx[$k]
    $ny = $y + $dy[$k]
    if ($nx -lt 0) { continue }
    if ($ny -lt 0) { continue }
    if ($nx -ge $imgW) { continue }
    if ($ny -ge $imgH) { continue }
    $nid = $ny * $imgW + $nx
    if ($seen[$nid]) { continue }
    $ni = $ny * $stride + $nx * 4
    $r = [int]$bytes[$ni + 2]; $g = [int]$bytes[$ni + 1]; $b = [int]$bytes[$ni]
    if ([Math]::Abs($r - $cr) -gt $Tol) { continue }
    if ([Math]::Abs($g - $cg) -gt $Tol) { continue }
    if ([Math]::Abs($b - $cb) -gt $Tol) { continue }
    $seen[$nid] = $true
    $qx.Enqueue($nx); $qy.Enqueue($ny)
  }
}

[System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
$bmp.UnlockBits($data)
$dir = Split-Path -Parent $Out
if ($dir -and -not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
$bmp.Save([IO.Path]::GetFullPath($Out), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "OK $Out"
