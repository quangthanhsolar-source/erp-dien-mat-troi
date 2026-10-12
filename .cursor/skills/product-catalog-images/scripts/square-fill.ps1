#Requires -Version 5.1
<#
.SYNOPSIS
  Trim near-white background, then contain-fit into a sharp white square.

.EXAMPLE
  powershell -NoProfile -File scripts/square-fill.ps1 -In src.jpg -Out dest.jpg

.EXAMPLE
  powershell -NoProfile -File scripts/square-fill.ps1 -Manifest mapping.json
#>
param(
  [string]$In,
  [string]$Out,
  [string]$Manifest,
  [int]$Size = 1000,
  [int]$Margin = 16,
  [int]$Threshold = 246,
  [long]$Quality = 94
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function Get-ContentRect {
  param(
    [System.Drawing.Bitmap]$Bmp,
    [int]$ThresholdValue = 246
  )
  $w = $Bmp.Width
  $h = $Bmp.Height
  $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
  $data = $Bmp.LockBits(
    $rect,
    [System.Drawing.Imaging.ImageLockMode]::ReadOnly,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )
  try {
    $stride = $data.Stride
    $bytes = New-Object byte[] ($stride * $h)
    [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
  } finally {
    $Bmp.UnlockBits($data)
  }

  $minX = $w; $minY = $h; $maxX = -1; $maxY = -1
  for ($y = 0; $y -lt $h; $y++) {
    $row = $y * $stride
    for ($x = 0; $x -lt $w; $x++) {
      $i = $row + ($x * 4)
      $b = $bytes[$i]; $g = $bytes[$i + 1]; $r = $bytes[$i + 2]
      if ($r -lt $ThresholdValue -or $g -lt $ThresholdValue -or $b -lt $ThresholdValue) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt 0) {
    return New-Object System.Drawing.Rectangle 0, 0, $w, $h
  }

  $pad = 2
  $x0 = [Math]::Max(0, $minX - $pad)
  $y0 = [Math]::Max(0, $minY - $pad)
  $x1 = [Math]::Min($w - 1, $maxX + $pad)
  $y1 = [Math]::Min($h - 1, $maxY + $pad)
  return New-Object System.Drawing.Rectangle $x0, $y0, ($x1 - $x0 + 1), ($y1 - $y0 + 1)
}

function Convert-ToEdgeFilledSquare {
  param(
    [string]$InPath,
    [string[]]$OutPaths,
    [int]$CanvasSize = 1000,
    [int]$EdgeMargin = 16,
    [int]$WhiteThreshold = 246,
    [long]$JpegQuality = 94
  )

  if (-not (Test-Path -LiteralPath $InPath)) {
    throw "Source not found: $InPath"
  }

  $loaded = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $InPath).Path)
  $src = New-Object System.Drawing.Bitmap $loaded
  $loaded.Dispose()

  try {
    $box = Get-ContentRect -Bmp $src -ThresholdValue $WhiteThreshold
    $avail = $CanvasSize - (2 * $EdgeMargin)
    $scale = [Math]::Min($avail / [double]$box.Width, $avail / [double]$box.Height)
    $dw = [int][Math]::Round($box.Width * $scale)
    $dh = [int][Math]::Round($box.Height * $scale)
    $dx = [int][Math]::Round(($CanvasSize - $dw) / 2.0)
    $dy = [int][Math]::Round(($CanvasSize - $dh) / 2.0)

    $bmp = New-Object System.Drawing.Bitmap $CanvasSize, $CanvasSize
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.Clear([System.Drawing.Color]::White)
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $destRect = New-Object System.Drawing.Rectangle $dx, $dy, $dw, $dh
      $g.DrawImage($src, $destRect, $box, [System.Drawing.GraphicsUnit]::Pixel)

      $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
        Where-Object { $_.MimeType -eq 'image/jpeg' }
      $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
      $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter (
        [System.Drawing.Imaging.Encoder]::Quality, $JpegQuality
      )
      try {
        $first = $null
        foreach ($outPath in $OutPaths) {
          $dir = Split-Path -Parent $outPath
          if ($dir -and -not (Test-Path -LiteralPath $dir)) {
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
          }
          $full = [System.IO.Path]::GetFullPath($outPath)
          if ($null -eq $first) {
            $bmp.Save($full, $enc, $ep)
            $first = $full
          } elseif ($full -ne $first) {
            Copy-Item -LiteralPath $first -Destination $full -Force
          }
        }
      } finally {
        $ep.Dispose()
      }
    } finally {
      $g.Dispose()
      $bmp.Dispose()
    }

    $fill = [Math]::Max($dw, $dh) / $CanvasSize
    $name = [IO.Path]::GetFileName($InPath)
    Write-Host ("{0}: crop {1}x{2} -> draw {3}x{4} at ({5},{6})  fill={7:p0}" -f `
      $name, $box.Width, $box.Height, $dw, $dh, $dx, $dy, $fill)
  } finally {
    $src.Dispose()
  }
}

if ($Manifest) {
  if (-not (Test-Path -LiteralPath $Manifest)) {
    throw "Manifest not found: $Manifest"
  }
  $json = Get-Content -LiteralPath $Manifest -Raw -Encoding UTF8 | ConvertFrom-Json
  $canvas = if ($json.size) { [int]$json.size } else { $Size }
  $edge = if ($null -ne $json.margin) { [int]$json.margin } else { $Margin }
  $thr = if ($json.threshold) { [int]$json.threshold } else { $Threshold }
  $q = if ($json.quality) { [long]$json.quality } else { $Quality }
  foreach ($item in $json.items) {
    $outs = @($item.out)
    if ($outs.Count -eq 0) { throw "Manifest item missing out: $($item.in)" }
    Convert-ToEdgeFilledSquare -InPath $item.in -OutPaths $outs `
      -CanvasSize $canvas -EdgeMargin $edge -WhiteThreshold $thr -JpegQuality $q
  }
  Write-Host "DONE $($json.items.Count) source(s)"
  return
}

if (-not $In -or -not $Out) {
  throw "Provide -In and -Out, or -Manifest mapping.json"
}

Convert-ToEdgeFilledSquare -InPath $In -OutPaths @($Out) `
  -CanvasSize $Size -EdgeMargin $Margin -WhiteThreshold $Threshold -JpegQuality $Quality
Write-Host 'DONE'
