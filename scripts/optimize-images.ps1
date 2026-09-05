param(
    [string]$SourceDirectory = (Join-Path $PSScriptRoot "..\source-images"),
    [string]$TargetDirectory = (Join-Path $PSScriptRoot "..\test\assets\img"),
    [ValidateRange(320, 8000)]
    [int]$MaxDimension = 1920,
    [ValidateRange(1, 100)]
    [int]$JpegQuality = 85
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

try {
    Add-Type -AssemblyName System.Drawing.Common -ErrorAction Stop
}
catch {
    Add-Type -AssemblyName System.Drawing -ErrorAction Stop
}

$source = (Resolve-Path -LiteralPath $SourceDirectory).Path
$target = (Resolve-Path -LiteralPath $TargetDirectory).Path
$jpegCodec = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object MimeType -eq "image/jpeg" |
    Select-Object -First 1

if (-not $jpegCodec) {
    throw "JPEG encoder is not available."
}

function Set-ExifOrientation {
    param([Drawing.Image]$Image)

    $orientationId = 0x0112
    if ($Image.PropertyIdList -notcontains $orientationId) {
        return
    }

    $orientation = [BitConverter]::ToUInt16(
        $Image.GetPropertyItem($orientationId).Value,
        0
    )

    $rotation = switch ($orientation) {
        2 { [Drawing.RotateFlipType]::RotateNoneFlipX }
        3 { [Drawing.RotateFlipType]::Rotate180FlipNone }
        4 { [Drawing.RotateFlipType]::Rotate180FlipX }
        5 { [Drawing.RotateFlipType]::Rotate90FlipX }
        6 { [Drawing.RotateFlipType]::Rotate90FlipNone }
        7 { [Drawing.RotateFlipType]::Rotate270FlipX }
        8 { [Drawing.RotateFlipType]::Rotate270FlipNone }
        default { [Drawing.RotateFlipType]::RotateNoneFlipNone }
    }

    $Image.RotateFlip($rotation)
}

$files = Get-ChildItem -LiteralPath $source -Filter "*.jpg" -File | Sort-Object Name
if (-not $files) {
    throw "No JPG source images found in $source"
}

foreach ($file in $files) {
    $inputStream = [IO.File]::OpenRead($file.FullName)
    try {
        $image = [Drawing.Image]::FromStream($inputStream, $true, $true)
        try {
            Set-ExifOrientation -Image $image

            $scale = [Math]::Min(1.0, $MaxDimension / [double][Math]::Max($image.Width, $image.Height))
            $width = [Math]::Max(1, [int][Math]::Round($image.Width * $scale))
            $height = [Math]::Max(1, [int][Math]::Round($image.Height * $scale))
            $bitmap = [Drawing.Bitmap]::new($width, $height, [Drawing.Imaging.PixelFormat]::Format24bppRgb)
            try {
                $graphics = [Drawing.Graphics]::FromImage($bitmap)
                try {
                    $graphics.Clear([Drawing.Color]::Black)
                    $graphics.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceCopy
                    $graphics.CompositingQuality = [Drawing.Drawing2D.CompositingQuality]::HighQuality
                    $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                    $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::HighQuality
                    $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                    $graphics.DrawImage($image, 0, 0, $width, $height)
                }
                finally {
                    $graphics.Dispose()
                }

                $encoderParameters = [Drawing.Imaging.EncoderParameters]::new(1)
                try {
                    $encoderParameters.Param[0] = [Drawing.Imaging.EncoderParameter]::new(
                        [Drawing.Imaging.Encoder]::Quality,
                        [long]$JpegQuality
                    )

                    $destination = Join-Path $target $file.Name
                    $temporary = "$destination.optimizing"
                    $bitmap.Save($temporary, $jpegCodec, $encoderParameters)

                    $validationStream = [IO.File]::OpenRead($temporary)
                    try {
                        $validated = [Drawing.Image]::FromStream($validationStream, $true, $true)
                        try {
                            $decoded = [Drawing.Bitmap]::new($validated)
                            $decoded.Dispose()
                        }
                        finally {
                            $validated.Dispose()
                        }
                    }
                    finally {
                        $validationStream.Dispose()
                    }

                    Move-Item -LiteralPath $temporary -Destination $destination -Force
                    Write-Output "$($file.Name): $($image.Width)x$($image.Height) -> ${width}x${height}"
                }
                finally {
                    $encoderParameters.Dispose()
                }
            }
            finally {
                $bitmap.Dispose()
            }
        }
        finally {
            $image.Dispose()
        }
    }
    finally {
        $inputStream.Dispose()
    }
}
