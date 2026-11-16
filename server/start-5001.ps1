$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
$env:PORT='5001'
$env:NODE_ENV='development'
$env:MONGODB_URI='mongodb://127.0.0.1:27017/validation_engine'
Set-Location 'C:\Users\Tharaneesh.k\Downloads\Validation_engine\server'
& 'C:\Program Files\nodejs\node.exe' server.js
