@echo off
cd /d "C:\Users\Tharaneesh.k\Downloads\Validation_engine\client"
set PATH=C:\Program Files\nodejs;%PATH%
"C:\Program Files\nodejs\npm.cmd" run dev -- --host 0.0.0.0
