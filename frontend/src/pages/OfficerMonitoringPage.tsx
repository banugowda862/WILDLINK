import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import type { MonitoringDevice, Detection } from '../types';
import { useAlerts } from '../context/AlertContext';
import {
  Activity,
  Radio,
  Cpu,
  BatteryCharging,
  Sun,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  Sliders
} from 'lucide-react';

export const OfficerMonitoringPage: React.FC = () => {
  const { triggerDemo } = useAlerts();
  const [devices, setDevices] = useState<MonitoringDevice[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<MonitoringDevice | null>(null);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [loading, setLoading] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadData = async () => {
    try {
      const [devData, detData] = await Promise.all([
        api.getDevices(),
        api.getDetections(true)
      ]);
      setDevices(devData);
      setDetections(detData);
      if (devData.length > 0 && !selectedDevice) {
        setSelectedDevice(devData[0]);
      }
      if (detData.length > 0 && !selectedDetection) {
        setSelectedDetection(detData[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Render 32x24 MLX90640 Canvas Heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 32;
    const height = 24;
    const pixelSize = 10; // 320 x 240 rendered size

    canvas.width = width * pixelSize;
    canvas.height = height * pixelSize;

    // Synthetic heat distribution based on selected detection
    const ambient = selectedDetection?.ambient_temp_celsius || 22.0;
    const peak = selectedDetection?.max_temp_celsius || 36.5;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Center heat blob representing detected wildlife candidate
        const dist = Math.hypot(x - 16, y - 11);
        let temp = ambient;
        if (dist < 4.5) {
          temp = ambient + (peak - ambient) * Math.exp(-0.5 * Math.pow(dist / 1.8, 2));
        }

        // Color mapping from deep blue (cool ambient) to yellow/white (warm mammal body)
        const norm = Math.min(1, Math.max(0, (temp - 20) / 20));
        let r = 0, g = 0, b = 0;
        if (norm < 0.25) {
          b = Math.floor(norm * 4 * 255);
        } else if (norm < 0.5) {
          g = Math.floor((norm - 0.25) * 4 * 255);
          b = 255;
        } else if (norm < 0.75) {
          r = Math.floor((norm - 0.5) * 4 * 255);
          g = 255;
          b = Math.floor((1 - (norm - 0.5) * 4) * 255);
        } else {
          r = 255;
          g = Math.floor((1 - (norm - 0.75) * 4) * 200 + 55);
          b = Math.floor((norm - 0.75) * 4 * 255);
        }

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }

    // Draw Candidate Bounding Box
    if (selectedDetection?.bounding_boxes && selectedDetection.bounding_boxes.length > 0) {
      const bbox = selectedDetection.bounding_boxes[0];
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(bbox.x * pixelSize, bbox.y * pixelSize, bbox.w * pixelSize, bbox.h * pixelSize);

      ctx.fillStyle = '#ef4444';
      ctx.font = '10px monospace';
      ctx.fillText(`Target: ${bbox.label}`, (bbox.x * pixelSize) + 2, (bbox.y * pixelSize) - 4);
    }
  }, [selectedDetection]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-700">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>Thermal Vision & Edge Sensor Telemetry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Thermal Monitoring Grid</h1>
          <p className="text-sm text-slate-600">
            Live telemetry, MLX90640 far-infrared heat profiling, and candidate bounding box verification.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => triggerDemo('elephant_highway')}
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow"
          >
            <Play className="w-3.5 h-3.5 text-emerald-300" />
            <span>Simulate Sensor Event</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Monitoring Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Thermal Canvas & Selected Event Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  SENSOR ACTIVE: {selectedDevice?.device_id || 'WILDLINK-ROAD-001'}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedDevice?.name || 'Bandipur Highway Post'}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">
                  {selectedDevice?.status || 'ONLINE'}
                </span>
              </div>
            </div>

            {/* Thermal Display Canvas */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-4">
                <span>MLX90640 Far-Infrared (32×24 array)</span>
                <span>•</span>
                <span className="text-emerald-400">FPS: 4 Hz (I2C 400kHz)</span>
              </div>

              <div className="relative border-2 border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                <canvas ref={canvasRef} className="block" style={{ width: '384px', height: '288px', imageRendering: 'pixelated' }} />
              </div>

              {/* Temperature Scale Indicator */}
              <div className="w-full max-w-sm space-y-1">
                <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-700 via-emerald-500 via-amber-400 to-rose-600 shadow-inner" />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Ambient: {selectedDetection?.ambient_temp_celsius || 22.0}°C</span>
                  <span className="text-amber-300 font-bold">Mammalian Core: {selectedDetection?.max_temp_celsius || 36.8}°C</span>
                </div>
              </div>
            </div>

            {/* Selected Detection Details */}
            {selectedDetection && (
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">
                    Candidate: {selectedDetection.possible_species}
                  </span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    Confidence: {(selectedDetection.detection_confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>Detection ID: <span className="text-white">{selectedDetection.detection_id}</span></div>
                  <div>Risk: <span className="text-amber-400 uppercase">{selectedDetection.risk_level}</span></div>
                  <div>Status: <span className="text-cyan-400 capitalize">{selectedDetection.verification_status}</span></div>
                  <div>Simulated: <span className="text-white">{selectedDetection.simulated ? 'YES (DEMO)' : 'NO'}</span></div>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed">
                  <strong>Verification Note:</strong> MLX90640 signatures identify mammalian heat masses.
                  Species classification remains candidate-only until officer confirms with secondary visual or field report.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Device Registry & Detection History */}
        <div className="space-y-6">
          {/* Active Devices */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Radio className="w-4 h-4 text-sky-600" />
              <span>Monitoring Posts ({devices.length})</span>
            </h3>

            <div className="space-y-2.5">
              {devices.map((dev) => (
                <div
                  key={dev.device_id}
                  onClick={() => setSelectedDevice(dev)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs space-y-1.5 ${
                    selectedDevice?.device_id === dev.device_id
                      ? 'bg-sky-50 border-sky-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{dev.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      dev.status === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {dev.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{dev.installation_area}</div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Battery: {dev.battery_level}%</span>
                    <span>CPU: {dev.cpu_usage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Detection Events */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Detection Log ({detections.length})</span>
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {detections.map((det) => (
                <div
                  key={det.detection_id}
                  onClick={() => setSelectedDetection(det)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs space-y-1 ${
                    selectedDetection?.detection_id === det.detection_id
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{det.possible_species}</span>
                    {det.simulated && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">DEMO</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Device: {det.device_id} • {(det.detection_confidence * 100).toFixed(0)}% conf
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(det.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
