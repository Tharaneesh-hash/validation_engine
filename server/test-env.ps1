$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
$env:PORT='5000'
$env:NODE_ENV='test'
$env:MONGODB_URI='mongodb://127.0.0.1:27017/validation_engine'
Set-Location 'C:\Users\Tharaneesh.k\Downloads\Validation_engine\server'
& 'C:\Program Files\nodejs\node.exe' -e "import('./server.js').then(() => console.log('loaded')).catch(err => { console.error(err); process.exit(1); })"
