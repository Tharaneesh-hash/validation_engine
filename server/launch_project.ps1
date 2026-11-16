$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
$env:PORT = '5001'
$env:NODE_ENV = 'development'
$env:MONGODB_URI = 'mongodb://127.0.0.1:27017/validation_engine'
Set-Location 'C:\Users\Tharaneesh.k\Downloads\Validation_engine\server'
Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -ArgumentList 'server.js' -WorkingDirectory 'C:\Users\Tharaneesh.k\Downloads\Validation_engine\server'
Set-Location 'C:\Users\Tharaneesh.k\Downloads\Validation_engine\client'
Start-Process -FilePath 'C:\Program Files\nodejs\npm.cmd' -ArgumentList 'run','dev','--','--host','0.0.0.0' -WorkingDirectory 'C:\Users\Tharaneesh.k\Downloads\Validation_engine\client'
Write-Host 'Open http://localhost:5173'
