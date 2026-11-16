@echo off
title Validation Engine - Frontend Client
cd /d "%~dp0client"
set PATH=C:\Program Files\nodejs;%PATH%
"C:\Program Files\nodejs\npm.cmd" run dev
pause
