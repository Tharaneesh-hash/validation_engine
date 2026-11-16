$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
try {
  $resp = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing -TimeoutSec 10
  Write-Host 'STATUS:' $resp.StatusCode
  Write-Host $resp.Content
} catch {
  Write-Host 'HEALTH_CHECK_FAILED'
  Write-Host $_.Exception.Message
  exit 1
}
