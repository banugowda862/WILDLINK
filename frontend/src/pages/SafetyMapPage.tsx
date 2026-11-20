import React, { useEffect, useState } from 'react';
import { LeafletMap } from '../components/LeafletMap';
import { api } from '../services/api';
import type { Alert, IncidentReport, MonitoringDevice, Detection } from '../types';
import { useAuth } from '../context/AuthContext';
import { MapPin, Shield, AlertTriangle, Radio, RefreshCw, Info } from 'lucide-react';

export const SafetyMapPage: React.FC = () => {
  const { isOfficer } = useAuth();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<MonitoringDevice[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [repData, altData, devData, detData] = await Promise.all([
        api.getReports(),
        api.getAlerts(true, true),
        api.getDevices(),
        api.getDetections(true)
      ]);
      setReports(repData);
      setAlerts(altData);
      setDevices(devData);
      setDetections(detData);
    } catch (e) {
      console.error('Failed to load map data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Geospatial Coexistence Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Wildlife Safety Map</h1>
          <p className="text-sm text-slate-600">
            Real-time verified wildlife activity zones, road crossing cautions and IoT sensor posts.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Map</span>
        </button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-950 flex items-start space-x-3">
        <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <strong>Location Privacy Architecture:</strong> Public viewers see generalized ~800m approximate radii
          to prevent poaching and human interference with wildlife. Exact GPS coordinates and sensor posts are restricted
          to <strong>Authorized Forest Officers</strong>.
        </div>
      </div>

      {/* Interactive Map */}
      <LeafletMap
        reports={reports}
        alerts={alerts}
        devices={devices}
        detections={detections}
        height="580px"
        allowLayerSwitch={true}
      />

      {/* Side-by-Side Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Active Alerts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Active Road & Forest Warnings ({alerts.length})</span>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {alerts.map((alt) => (
              <div
                key={alt.alert_id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{alt.title}</span>
                  {alt.simulated && (
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">DEMO</span>
                  )}
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{alt.message}</p>
                <div className="text-[10px] text-slate-400 font-medium pt-1">
                  Area: {alt.area_name} ({alt.radius_km} km radius)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monitoring Devices */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 text-sky-700 font-bold text-sm">
              <Radio className="w-4 h-4" />
              <span>Thermal Sensor Nodes ({devices.length})</span>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {devices.map((dev) => (
              <div
                key={dev.device_id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{dev.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    dev.status === 'online'
                      ? 'bg-emerald-100 text-emerald-800'
                      : dev.status === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {dev.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Installation: {dev.installation_area}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Battery: {dev.battery_level}% (Solar)</span>
                  <span>Sensor: {dev.thermal_sensor_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Field Reports */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>Verified Reports ({reports.length})</span>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {reports.slice(0, 5).map((rep) => (
              <div
                key={rep.report_id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{rep.species}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1 rounded">
                    {rep.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] line-clamp-2">{rep.title}</p>
                <div className="text-[10px] text-slate-400">
                  {rep.location_name} • Reported by {rep.reporter_role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
