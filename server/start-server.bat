@echo off
set PATH=C:\Program Files\nodejs;%PATH%
set PORT=5001
set NODE_ENV=development
set MONGODB_URI=mongodb://127.0.0.1:27017/validation_engine
cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" server.js
