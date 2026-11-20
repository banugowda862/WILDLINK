@echo off
title WILDLINK Vite React Frontend (Port 5173)
echo ========================================================
echo Starting WILDLINK Vite Web Platform on port 5173...
echo Open http://localhost:5173 in your browser
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
pause
