import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { RescueCase } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  HeartHandshake,
  AlertTriangle,
  PlusCircle,
  Stethoscope,
  Activity,
  PhoneCall,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const RescuePage: React.FC = () => {
  const { isOfficer } = useAuth();
  const [cases, setCases] = useState<RescueCase[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [animalType, setAnimalType] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'urgent' | 'life_threatening'>('urgent');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadCases = async () => {
    try {
      const data = await api.getRescueCases();
      setCases(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleSubmitRescue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalType || !description || !locationName) {
      alert('Please fill all mandatory fields');
      return;
    }

    try {
      await api.createRescueCase({
        animal_type: animalType,
        urgency,
        description,
        location_name: locationName,
        latitude: 11.95,
        longitude: 76.10,
        reporter_phone: reporterPhone,
        assigned_team: 'Forest Range Mobile Veterinary Unit',
        veterinarian_name: 'Dr. K. Rao (Wildlife Vet)'
      });
      setSuccessMsg('Rescue case created! Emergency veterinary team dispatched.');
      setShowModal(false);
      loadCases();
    } catch (err: any) {
      alert('Error creating case: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>Emergency Veterinary & Wildlife Response</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Wildlife Rescue Operations</h1>
          <p className="text-sm text-slate-600">
            Prompt, certified veterinary assistance for injured, entangled, sick or orphaned wild animals.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition flex items-center space-x-2 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Animal Needing Rescue</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3 rounded-xl flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Emergency Hotline Notice */}
      <div className="bg-emerald-950 text-white p-6 rounded-2xl border border-emerald-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
            <PhoneCall className="w-4 h-4 text-rose-400" />
            <span>24/7 Rapid Response Rescue Hotline: 1800-945-3546</span>
          </div>
          <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
            For critical emergencies involving leopards, elephants or venomous snakes near residential quarters,
            call immediately. Do not attempt rescue alone. Keep crowds away from the animal.
          </p>
        </div>
      </div>

      {/* Active Rescue Cases Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <span>Active Rescue Operations ({cases.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div key={c.rescue_id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    🩺
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{c.animal_type}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{c.rescue_id}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  c.urgency === 'urgent' || c.urgency === 'life_threatening'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {c.urgency.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>

              <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                <div>Location: <strong>{c.location_name}</strong></div>
                <div>Assigned Unit: <strong>{c.assigned_team || 'Mobilising'}</strong></div>
                {c.veterinarian_name && (
                  <div>Veterinarian: <strong>{c.veterinarian_name}</strong></div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Status: <strong className="text-emerald-700 capitalize">{c.status.replace('_', ' ')}</strong></span>
                </span>
                {isOfficer && (
                  <span className="text-xs text-emerald-700 font-semibold cursor-pointer hover:underline">
                    Manage Case →
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rescue Intake Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Request Animal Rescue</h3>
            <form onSubmit={handleSubmitRescue} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Animal Species / Type</label>
                <input
                  type="text"
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value)}
                  placeholder="e.g. Spotted Deer, Barn Owl, Python"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Urgency Level</label>
                <select
                  value={urgency}
                  onChange={(e: any) => setUrgency(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                >
                  <option value="life_threatening">Life-Threatening Emergency</option>
                  <option value="urgent">Urgent Injury / Entangled</option>
                  <option value="medium">Medium / Sick / Needs Evaluation</option>
                  <option value="low">Low Urgency (Orphaned / Displaced)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Location Details</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Near canal, Sector 4, Nagarhole Buffer"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description of Injury & Condition</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain visible injuries, entanglement, bleeding, or mobility..."
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Your Contact Phone</label>
                <input
                  type="text"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91 91234 56789"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
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
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg shadow"
                >
                  Dispatch Rescue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
