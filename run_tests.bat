@echo off
title Validation Engine - Test Suite
cd /d "%~dp0server"
set PATH=C:\Program Files\nodejs;%PATH%
"C:\Program Files\nodejs\node.exe" .\node_modules\vitest\vitest.mjs run --pool=forks
pause
