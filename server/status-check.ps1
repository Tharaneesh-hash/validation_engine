$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
netstat -ano | findstr :5000
Get-Process node -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path
