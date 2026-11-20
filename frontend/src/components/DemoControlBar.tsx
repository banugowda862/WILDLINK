import React, { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { AlertTriangle, Play, RefreshCw, Shield, UserCheck, X } from 'lucide-react';
import { api } from '../services/api';

export const DemoControlBar: React.FC = () => {
  const { triggerDemo, notificationToast, dismissToast } = useAlerts();
  const { role, setRole } = useAuth();
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
    <div className="bg-amber-900/90 text-amber-100 text-xs border-b border-amber-700/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-semibold tracking-wide uppercase text-[10px] bg-amber-800 text-amber-200 px-1.5 py-0.5 rounded">
            Demo Mode Active
          </span>
          <span className="hidden sm:inline text-amber-200/80">
            Fictional corridors & simulated sensor events. No real emergency dispatches.
          </span>
        </div>

        {/* Quick Simulator Buttons */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-amber-300 font-medium hidden md:inline">Simulate Sensor:</span>
          <button
            onClick={() => triggerDemo('elephant_highway')}
            className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-2 py-1 rounded flex items-center space-x-1 font-medium transition"
            title="Simulate thermal elephant detection on Bandipur NH-766"
          >
            <Play className="w-3 h-3 text-emerald-300" />
            <span>Elephant NH-766</span>
          </button>
          <button
            onClick={() => triggerDemo('wild_boar_farm')}
            className="bg-amber-800 hover:bg-amber-700 text-amber-100 px-2 py-1 rounded flex items-center space-x-1 font-medium transition"
            title="Simulate wild boar crop threat detection"
          >
            <Play className="w-3 h-3 text-amber-300" />
            <span>Boar Farm</span>
          </button>
          <button
            onClick={() => triggerDemo('predator_perimeter')}
            className="bg-rose-900 hover:bg-rose-800 text-rose-100 px-2 py-1 rounded flex items-center space-x-1 font-medium transition"
            title="Simulate predator perimeter detection"
          >
            <Play className="w-3 h-3 text-rose-300" />
            <span>Predator</span>
          </button>

          {/* Quick Role Switcher for instant evaluator testing */}
          <div className="flex items-center space-x-1 bg-black/30 rounded px-1.5 py-0.5 ml-2">
            <UserCheck className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-slate-300">View as:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-transparent text-amber-100 text-[11px] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="public" className="bg-slate-900 text-white">Public Visitor</option>
              <option value="farmer" className="bg-slate-900 text-white">Farmer</option>
              <option value="resident" className="bg-slate-900 text-white">Resident</option>
              <option value="driver" className="bg-slate-900 text-white">Driver</option>
              <option value="volunteer" className="bg-slate-900 text-white">Volunteer</option>
              <option value="forest_officer" className="bg-slate-900 text-white">Forest Officer (Auth)</option>
              <option value="admin" className="bg-slate-900 text-white">Administrator</option>
            </select>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded flex items-center space-x-1 transition"
            title="Reset database to seed"
          >
            <RefreshCw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset</span>
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
