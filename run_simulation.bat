@echo off
title WILDLINK IoT Edge Node Sensor Simulation
echo ========================================================
echo Starting WILDLINK Raspberry Pi MLX90640 Simulator...
echo Emitting heartbeats and thermal events to http://localhost:8000
echo ========================================================
cd /d "%~dp0hardware"
python main.py --simulate --base-url http://localhost:8000
pause
