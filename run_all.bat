@echo off
title WILDLINK Platform Launcher
echo ========================================================
echo Launching WILDLINK Integrated Coexistence Platform...
echo ========================================================

echo Starting Backend Server on Port 8000...
start "WILDLINK Backend" cmd /c "cd /d "%~dp0" && python backend/main.py"

echo Waiting 2 seconds for API to initialize...
timeout /t 2 /nobreak >nul

echo Starting Frontend on Port 5173...
start "WILDLINK Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo WILDLINK is starting up!
echo Frontend will be reachable at: http://localhost:5173
echo Backend API & Swagger Docs at: http://localhost:8000/docs
echo.
pause
