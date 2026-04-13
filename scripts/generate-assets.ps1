Add-Type -AssemblyName System.Drawing

$publicDir = "c:\eventos\public"

function New-Icon {
  param (
    [string]$Path,
    [int]$Size
  )

  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml("#003366"))

  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#D4AF37"))
  $font = New-Object System.Drawing.Font("Arial", [float]($Size * 0.42), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)
  $g.DrawString("E", $font, $brush, $rect, $format)

  $g.Dispose()
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

function New-Poster {
  param (
    [string]$Path
  )

  $width = 1200
  $height = 800
  $bmp = New-Object System.Drawing.Bitmap($width, $height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml("#003366"))

  $gold = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#D4AF37"))
  $light = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#F5F5F5"))
  $leaf = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#2E8B57"))

  $g.FillEllipse($gold, 420, 120, 360, 360)
  $g.FillEllipse($light, 470, 170, 260, 260)
  $g.FillEllipse($gold, 520, 220, 160, 160)
  $g.FillRectangle($leaf, 180, 540, 840, 24)
  $g.FillRectangle($light, 220, 590, 760, 14)

  $g.Dispose()
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $bmp.Dispose()
}

function New-QrCodePlaceholder {
  param (
    [string]$Path
  )

  $size = 900
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::White)

  $black = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
  for ($x = 0; $x -lt 29; $x++) {
    for ($y = 0; $y -lt 29; $y++) {
      if ((($x * 7 + $y * 11) % 5) -eq 0) {
        $g.FillRectangle($black, 30 + $x * 28, 30 + $y * 28, 20, 20)
      }
    }
  }

  $font = New-Object System.Drawing.Font("Arial", 72, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $g.DrawString("PIX", $font, $black, 340, 400)

  $g.Dispose()
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

New-Icon -Path "$publicDir\pwa-192x192.png" -Size 192
New-Icon -Path "$publicDir\pwa-512x512.png" -Size 512
New-Icon -Path "$publicDir\apple-touch-icon.png" -Size 180
New-Poster -Path "$publicDir\palestrante.jpg"
New-Poster -Path "$publicDir\cantora.jpg"
New-QrCodePlaceholder -Path "$publicDir\qrcode.png"
