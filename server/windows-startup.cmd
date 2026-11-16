@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "C:\Users\Tharaneesh.k\Downloads\Validation_engine\server"
set PORT=5001
set NODE_ENV=development
set MONGODB_URI=mongodb://127.0.0.1:27017/validation_engine
start "Validation Engine Backend" cmd /k "node server.js"
cd /d "C:\Users\Tharaneesh.k\Downloads\Validation_engine\client"
start "Validation Engine Frontend" cmd /k "npm run dev -- --host 0.0.0.0"
echo App launched.
echo Open http://localhost:5173
