import React, { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { AlertTriangle, Play, RefreshCw, Shield, UserCheck, X, Camera, Navigation, Home } from 'lucide-react';
import { api } from '../services/api';
import { Link, useLocation } from 'react-router-dom';

export const DemoControlBar: React.FC = () => {
  const { triggerDemo, notificationToast, dismissToast } = useAlerts();
  const { role, setRole } = useAuth();
  const location = useLocation();
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (confirm('Reset database to default seed data?')) {
      setResetting(true);
      try {
        await api.resetDemoData();
        window.location.reload();
      } catch (e) {
        alert('Reset failed: ' + e);
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="bg-amber-950/95 text-amber-100 text-xs border-b border-amber-800/60 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-semibold tracking-wide uppercase text-[10px] bg-amber-800 text-amber-200 px-1.5 py-0.5 rounded">
            College Presentation Mode
          </span>

          {/* Quick Demo Mode Links */}
          <div className="flex items-center space-x-1 border-l border-amber-800/80 pl-2">
            <Link
              to="/live-camera"
              className={`px-2 py-0.5 rounded flex items-center space-x-1 font-bold transition text-[11px] ${
                location.pathname === '/live-camera'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-900/60 hover:bg-rose-800 text-rose-200'
              }`}
              title="Open laptop webcam YOLO animal detector"
            >
              <Camera className="w-3 h-3 text-rose-300" />
              <span>Live Webcam</span>
            </Link>

            <Link
              to="/journey-safety"
              className={`px-2 py-0.5 rounded flex items-center space-x-1 font-medium transition text-[11px] ${
                location.pathname === '/journey-safety'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-950/60 hover:bg-indigo-900 text-indigo-200'
              }`}
              title="Open traveller route safety dashboard"
            >
              <Navigation className="w-3 h-3 text-indigo-300" />
              <span>Journey Safety</span>
            </Link>

            <Link
              to="/village-safety"
              className={`px-2 py-0.5 rounded flex items-center space-x-1 font-medium transition text-[11px] ${
                location.pathname === '/village-safety'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200'
              }`}
              title="Open rural village advisory board"
            >
              <Home className="w-3 h-3 text-emerald-300" />
              <span>Village Safety</span>
            </Link>
          </div>
        </div>

        {/* Quick Simulator Buttons & Role Switcher */}
        <div className="flex items-center space-x-2">
          {/* Quick Role Switcher for instant evaluator testing */}
          <div className="flex items-center space-x-1 bg-black/40 rounded px-2 py-0.5 border border-amber-800/50">
            <UserCheck className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-amber-200/80">Active Role:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-transparent text-amber-100 text-[11px] font-bold focus:outline-none cursor-pointer"
            >
              <option value="forest_officer" className="bg-slate-900 text-white">Forest Officer (Auth)</option>
              <option value="driver" className="bg-slate-900 text-white">Driver / Traveller</option>
              <option value="resident" className="bg-slate-900 text-white">Village Resident</option>
              <option value="farmer" className="bg-slate-900 text-white">Farmer</option>
              <option value="public" className="bg-slate-900 text-white">Public Visitor</option>
              <option value="admin" className="bg-slate-900 text-white">Administrator</option>
            </select>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded flex items-center space-x-1 transition text-[11px] border border-slate-700"
            title="Reset database to default seed state"
          >
            <RefreshCw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Real-time Toast notification */}
      {notificationToast && (
        <div className="bg-emerald-900 border-t border-emerald-700 text-white px-4 py-2 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">{notificationToast}</span>
          </div>
          <button onClick={dismissToast} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
