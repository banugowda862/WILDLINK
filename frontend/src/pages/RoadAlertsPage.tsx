import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { RoadSafetyZone, Alert, IncidentReport } from '../types';
import {
  Car,
  AlertTriangle,
  ShieldAlert,
  Gauge,
  Navigation,
  CheckCircle2,
  PhoneCall,
  Clock
} from 'lucide-react';

export const RoadAlertsPage: React.FC = () => {
  const [zones, setZones] = useState<RoadSafetyZone[]>([]);
  const [roadAlerts, setRoadAlerts] = useState<Alert[]>([]);
  const [roadkillReports, setRoadkillReports] = useState<IncidentReport[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [zData, aData, rData] = await Promise.all([
          api.getRoadZones(),
          api.getAlerts(true, true),
          api.getReports('wildlife_road_crossing')
        ]);
        setZones(zData);
        setRoadAlerts(aData.filter((a) => a.alert_type === 'wildlife_crossing'));
        setRoadkillReports(rData);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-700">
          <Car className="w-4 h-4 text-rose-600" />
          <span>Highway & Railway Wildlife Protection</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Road & Wildlife Corridors</h1>
        <p className="text-sm text-slate-600">
          Verified danger alerts, vehicle speed enforcement zones and nocturnal wildlife crossing advisories.
        </p>
      </div>

      {/* Driver Caution Banner */}
      <div className="bg-rose-950 text-white p-6 rounded-2xl border border-rose-900 shadow-lg space-y-3">
        <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
          <span>OFFICIAL FOREST HIGHWAY ADVISORY</span>
        </div>
        <p className="text-sm text-rose-100 leading-relaxed">
          “Wildlife activity reported near forest highway stretches. Reduce vehicle speed to under 30 km/h,
          refrain from honking or using high-beam headlights, and never step out of your vehicle to photograph animals.”
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-rose-200/80 pt-2 border-t border-rose-900/60">
          <span>🕒 Night Traffic Ban Active on NH-766 (9:00 PM – 6:00 AM)</span>
          <span>•</span>
          <span>Speed Limit: 30 km/h</span>
          <span>•</span>
          <span>Fine for speeding in tiger reserve: ₹5,000</span>
        </div>
      </div>

      {/* Active Road Safety Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => (
          <div key={zone.zone_id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">{zone.highway_no}</span>
                <h3 className="font-extrabold text-slate-900 text-lg">{zone.road_name}</h3>
              </div>
              <div className="bg-rose-100 text-rose-900 p-2 rounded-xl text-center">
                <Gauge className="w-5 h-5 mx-auto text-rose-700" />
                <span className="text-[10px] font-bold block">{zone.active_speed_limit_kmh} km/h</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div>
                <span className="text-slate-400">Monitored Stretch:</span>{' '}
                <strong className="text-slate-800">{zone.stretch_km}</strong>
              </div>
              <div>
                <span className="text-slate-400">High Risk Animals:</span>{' '}
                <strong className="text-rose-700">{zone.high_risk_species.join(', ')}</strong>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Thermal Sentry Node Active</span>
              </span>
              <span className="text-slate-400 text-[11px]">24/7 IR Camera</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Crossing Alerts & Reports */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <span>Active Highway Warning Broadcasts ({roadAlerts.length})</span>
        </h2>

        <div className="space-y-3">
          {roadAlerts.map((alt) => (
            <div key={alt.alert_id} className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{alt.title}</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">{alt.message}</p>
              <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Coverage: {alt.area_name}</span>
                <span>Source: {alt.source.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
