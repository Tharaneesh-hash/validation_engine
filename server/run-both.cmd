@echo off
set PATH=C:\Program Files\nodejs;%PATH%
start "Backend" cmd /k "cd /d "C:\Users\Tharaneesh.k\Downloads\Validation_engine\server" && set PORT=5000 && set NODE_ENV=development && set MONGODB_URI=mongodb://127.0.0.1:27017/validation_engine && "C:\Program Files\nodejs\node.exe" server.js"
start "Frontend" cmd /k "cd /d "C:\Users\Tharaneesh.k\Downloads\Validation_engine\client" && "C:\Program Files\nodejs\npm.cmd" run dev -- --host 0.0.0.0"
echo Started backend and frontend.
echo Visit http://localhost:5173
