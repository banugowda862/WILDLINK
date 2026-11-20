import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { IncidentReport, Farm, Alert } from '../types';
import {
  User,
  FileText,
  Tractor,
  Bell,
  MapPin,
  Shield,
  ArrowRight,
  Clock
} from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const { user, role } = useAuth();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [rData, fData, aData] = await Promise.all([
          api.getReports(),
          api.getFarms(),
          api.getAlerts(true, true)
        ]);
        setReports(rData);
        setFarms(fData);
        setAlerts(aData);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Header */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {user?.displayName.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{user?.displayName || 'User Profile'}</h1>
              <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/report"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow transition"
          >
            + New Incident Report
          </Link>
        </div>
      </div>

      {/* Grid: Reports & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Submitted Reports */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>My Submitted Incident Reports ({reports.length})</span>
              </h3>
            </div>

            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.report_id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{rep.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rep.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rep.status === 'pending_verification'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {rep.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{rep.description}</p>
                  <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Species: <strong>{rep.species}</strong> • {rep.location_name}</span>
                    <span>{new Date(rep.date_time).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Farms & Safety Areas */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Tractor className="w-4 h-4 text-amber-600" />
              <span>Registered Farm Plots</span>
            </h3>

            {farms.length === 0 ? (
              <p className="text-xs text-slate-400">No farms registered yet.</p>
            ) : (
              <div className="space-y-3">
                {farms.map((f) => (
                  <div key={f.farm_id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-slate-900">{f.farm_name}</div>
                    <div className="text-[11px] text-slate-600">{f.location_name} ({f.size_acres} acres)</div>
                    <div className="text-[10px] text-amber-800">Crops: {f.crops.join(', ')}</div>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/crop-protection"
              className="inline-block text-xs text-amber-700 font-bold hover:underline pt-2"
            >
              Manage Farms & Compensation →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
