$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing -TimeoutSec 10
  Write-Host "Status:$($r.StatusCode)"
  Write-Host $r.Content
} catch {
  Write-Host "HEALTH_CHECK_FAILED"
  Write-Host $_.Exception.Message
  exit 1
}
