import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { EnvironmentalThreat } from '../types';
import {
  Flame,
  AlertTriangle,
  Droplets,
  ShieldAlert,
  PlusCircle,
  Clock,
  MapPin,
  Trash2
} from 'lucide-react';

export const EnvironmentalThreatsPage: React.FC = () => {
  const [threats, setThreats] = useState<EnvironmentalThreat[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [threatType, setThreatType] = useState('forest_fire');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      const data = await api.getEnvironmentalThreats();
      setThreats(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locationName) {
      alert('Please fill all fields');
      return;
    }

    try {
      await api.createEnvironmentalThreat({
        threat_type: threatType,
        severity,
        title,
        description,
        location_name: locationName,
        latitude: 11.98,
        longitude: 76.08
      });
      setSuccessMsg('Environmental threat reported to Forest Command Control!');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert('Error submitting report: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-orange-700">
            <Flame className="w-4 h-4 text-orange-600" />
            <span>Ecological Integrity Monitoring</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Environmental & Forest Threats</h1>
          <p className="text-sm text-slate-600">
            Early detection of forest fires, wire snares, poaching, illegal encroachment, water scarcity and habitat fragmentation.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-700 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition flex items-center space-x-2 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Threat / Hazard</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3 rounded-xl flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Threats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {threats.map((t) => (
          <div key={t.threat_id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold uppercase text-[10px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded">
                {t.threat_type.replace('_', ' ')}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                t.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {t.severity}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-sm leading-snug">{t.title}</h3>
            <p className="text-slate-600 leading-relaxed">{t.description}</p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{t.location_name}</span>
              </span>
              <span className="capitalize font-semibold text-slate-600">{t.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Report Environmental Hazard</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Threat Category</label>
                <select
                  value={threatType}
                  onChange={(e) => setThreatType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                >
                  <option value="forest_fire">Forest Fire / Smoke</option>
                  <option value="habitat_destruction">Habitat Destruction / Deforestation</option>
                  <option value="poaching_trap">Illegal Wire Snare / Trap</option>
                  <option value="water_scarcity">Water Scarcity / Dried Waterhole</option>
                  <option value="pollution">Plastic / Toxic Chemical Pollution</option>
                  <option value="wildlife_disease">Suspected Wildlife Disease Outbreak</option>
                  <option value="marine_threat">Marine / River Wildlife Threat</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e: any) => setSeverity(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                >
                  <option value="critical">Critical / Imminent Threat</option>
                  <option value="high">High Severity</option>
                  <option value="medium">Medium Concern</option>
                  <option value="low">Low Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Title / Brief Summary</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dry bamboo fire spotted near western sector"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Exact Area / Location</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Nagarhole Western Boundary Km 18"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe observed conditions, estimated spread, affected wildlife..."
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-700 hover:bg-orange-600 text-white font-bold rounded-lg shadow"
                >
                  Submit Threat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
