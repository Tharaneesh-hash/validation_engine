$mongoBin = 'C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe'
if (-not (Test-Path $mongoBin)) {
  Write-Host 'MongoDB server executable not found at ' $mongoBin
  exit 1
}
& $mongoBin --dbpath 'C:\data\db'
