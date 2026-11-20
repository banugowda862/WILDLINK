import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { AuditLog, MonitoringDevice } from '../types';
import {
  Shield,
  Users,
  Radio,
  Settings,
  History,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [devices, setDevices] = useState<MonitoringDevice[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      const [lData, dData, sData] = await Promise.all([
        api.getAuditLogs(),
        api.getDevices(),
        api.getSettings()
      ]);
      setLogs(lData);
      setDevices(dData);
      setSettings(sData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all mock databases to default clean seeds?')) {
      try {
        await api.resetDemoData();
        setMsg('Database reset to clean seeds.');
        loadData();
      } catch (err: any) {
        alert('Reset error: ' + err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-700">
          <Shield className="w-4 h-4 text-purple-600" />
          <span>Platform Administrator Operations</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin & Security Management</h1>
        <p className="text-sm text-slate-600">
          User roles, device provisioning, security audit trails and system configurations.
        </p>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3 rounded-xl flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs text-purple-700 font-bold uppercase tracking-wider">Registered Devices</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{devices.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">IoT Thermal Sentinels</div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Online Nodes</div>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {devices.filter((d) => d.status === 'online').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active heartbeats</div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs text-amber-700 font-bold uppercase tracking-wider">Audit Events</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{logs.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Immutable ledger items</div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs text-sky-700 font-bold uppercase tracking-wider">Environment</div>
          <div className="text-2xl font-black text-slate-900 mt-1">DEMO / STAGING</div>
          <div className="text-[11px] text-slate-400 mt-1">Safe offline isolation</div>
        </div>
      </div>

      {/* Quick Admin Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Administrative Controls</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Database to Initial Seeds</span>
          </button>
        </div>
      </div>

      {/* Security Audit Trail */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <History className="w-4 h-4 text-purple-600" />
            <span>Security Audit Logs</span>
          </h3>
          <span className="text-xs text-slate-400">Latest 50 actions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {log.actor_email} <span className="text-[10px] text-slate-400">({log.actor_role})</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-purple-900">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{log.target}</td>
                  <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
