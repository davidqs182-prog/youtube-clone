# Step 1: Close edge if running to unlock cookies database
Stop-Process -Name msedge -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

$YTDLP = "$PSScriptRoot\..\yt-dlp.exe"
$FFMPEG = "C:\Users\d.quiros\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffmpeg.exe"
$OUTPUT_DIR = "$PSScriptRoot\..\public\videos\bachata_fuego"
$COOKIES_FILE = "$PSScriptRoot\..\edge_cookies.txt"

# Step 2: Export cookies to edge_cookies.txt
Write-Host "Exporting Edge cookies to edge_cookies.txt..."
& "$YTDLP" --cookies-from-browser edge --cookies "$COOKIES_FILE" --print title "https://www.youtube.com/watch?v=VTjh1yRwAjg"

if (Test-Path "$COOKIES_FILE") {
    Write-Host "SUCCESS: edge_cookies.txt exported!"
} else {
    Write-Host "WARNING: edge_cookies.txt not created, using direct download."
}
