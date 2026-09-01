$src = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Network\Cookies"
$dst = path = Join-Path $PSScriptRoot "temp_cookies.sqlite"

try {
    $srcStream = [System.IO.File]::Open($src, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
    $dstStream = [System.IO.File]::Create("temp_cookies.sqlite")
    $srcStream.CopyTo($dstStream)
    $srcStream.Close()
    $dstStream.Close()
    Write-Host "COPIED SUCCESSFULLY!"
} catch {
    Write-Host "Error: $_"
}
