Add-Type -AssemblyName System.Drawing
$src = 'C:\Users\HP\.gemini\antigravity\brain\e54b55bd-069d-44e9-9672-bdbc97f34e86\app_icon_logo_1790761550322.jpg'
$img = [System.Drawing.Image]::FromFile($src)

$densities = [ordered]@{
    'mipmap-mdpi' = @{ launcher = 48; foreground = 108 }
    'mipmap-hdpi' = @{ launcher = 72; foreground = 162 }
    'mipmap-xhdpi' = @{ launcher = 96; foreground = 216 }
    'mipmap-xxhdpi' = @{ launcher = 144; foreground = 324 }
    'mipmap-xxxhdpi' = @{ launcher = 192; foreground = 432 }
}

foreach ($k in $densities.Keys) {
    $info = $densities[$k]
    $resDir = "D:\Class-Monitoring-System\Frontend\android\app\src\main\res\$k"
    if (Test-Path $resDir) {
        # 1. Launcher and round launcher
        $size = $info.launcher
        $bmp = New-Object System.Drawing.Bitmap $size, $size
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($img, 0, 0, $size, $size)
        $g.Dispose()

        if (Test-Path "$resDir\ic_launcher.webp") { Remove-Item "$resDir\ic_launcher.webp" -Force }
        if (Test-Path "$resDir\ic_launcher_round.webp") { Remove-Item "$resDir\ic_launcher_round.webp" -Force }

        $bmp.Save("$resDir\ic_launcher.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Save("$resDir\ic_launcher_round.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()

        # 2. Foreground for adaptive icon
        $fgSize = $info.foreground
        $fgBmp = New-Object System.Drawing.Bitmap $fgSize, $fgSize
        $fgG = [System.Drawing.Graphics]::FromImage($fgBmp)
        $fgG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $fgG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $fgG.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $fgG.DrawImage($img, 0, 0, $fgSize, $fgSize)
        $fgG.Dispose()

        if (Test-Path "$resDir\ic_launcher_foreground.webp") { Remove-Item "$resDir\ic_launcher_foreground.webp" -Force }
        $fgBmp.Save("$resDir\ic_launcher_foreground.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $fgBmp.Dispose()

        Write-Host "Generated launcher ($size) and foreground ($fgSize) for $k"
    }
}
$img.Dispose()
Write-Host "All Android icons updated successfully!"
