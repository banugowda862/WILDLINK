import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { IncidentReport } from '../types';
import { Compass, AlertCircle, Eye, ShieldCheck, MapPin, CheckCircle } from 'lucide-react';

export const SightingsPage: React.FC = () => {
  const [sightings, setSightings] = useState<IncidentReport[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getReports('residential_sighting');
        setSightings(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-700">
          <Compass className="w-4 h-4 text-cyan-600" />
          <span>Residential & Urban Fringe Safety</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">City & Village Wildlife Sightings</h1>
        <p className="text-sm text-slate-600">
          Verified notices of wildlife entering human habitations, school premises, villages and towns.
        </p>
      </div>

      {/* Safety Protocol Card */}
      <div className="bg-cyan-950 text-white p-6 rounded-2xl border border-cyan-900 shadow-md space-y-3">
        <h3 className="font-bold text-base text-cyan-300">
          Community Safety Guidelines for Residential Sightings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-cyan-100">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span><strong>DO NOT Crowd or Corner:</strong> Wild animals (especially leopards and elephants) attack only when cornered by mobs or noise.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span><strong>DO NOT Feed or Throw Stones:</strong> Feeding creates dangerous food-habituation and stone-throwing provokes defensive charges.</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Keep Children Indoors:</strong> Ensure small children and pets remain inside secured dwellings until forest patrol clears the area.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Notify Forest Range Office:</strong> Allow trained forest staff with tranquilisation kits to provide a peaceful return corridor.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sightings Feed */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Eye className="w-5 h-5 text-cyan-600" />
          <span>Active Village & Urban Fringe Sightings ({sightings.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sightings.map((s) => (
            <div key={s.report_id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{s.species}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  s.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {s.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">{s.description}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{s.location_name}</span>
                </span>
                <span>{new Date(s.date_time).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
