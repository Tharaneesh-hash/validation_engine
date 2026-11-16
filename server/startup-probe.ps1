$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
$TestUrl = 'http://localhost:5001/api/health'
try {
  $resp = Invoke-WebRequest -Uri $TestUrl -UseBasicParsing -TimeoutSec 10
  Write-Host 'OK:' $resp.StatusCode
  Write-Host $resp.Content
} catch {
  Write-Host 'FAILED:' $_.Exception.Message
  exit 1
}
