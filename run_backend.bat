@echo off
title WILDLINK FastAPI Backend Server (Port 8000)
echo ========================================================
echo Starting WILDLINK Core REST API Server on port 8000...
echo Swagger API Docs available at http://localhost:8000/docs
echo ========================================================
cd /d "%~dp0"
python backend/main.py
pause
