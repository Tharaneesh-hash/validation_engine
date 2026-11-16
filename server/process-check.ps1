$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
Get-Process node -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path
netstat -ano | findstr ':5001'
