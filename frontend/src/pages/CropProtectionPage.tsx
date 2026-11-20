import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Farm, IncidentReport } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Tractor,
  AlertTriangle,
  PlusCircle,
  ShieldCheck,
  FileText,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';

export const CropProtectionPage: React.FC = () => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [cropReports, setCropReports] = useState<IncidentReport[]>([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [sizeAcres, setSizeAcres] = useState('5.0');
  const [cropsInput, setCropsInput] = useState('Maize, Coffee, Banana');
  const [threatsInput, setThreatsInput] = useState('Asian Elephant, Wild Boar');
  const [phone, setPhone] = useState('+91 94481 00000');
  const [statusMessage, setStatusMessage] = useState('');

  const loadData = async () => {
    try {
      const [fData, rData] = await Promise.all([
        api.getFarms(),
        api.getReports('crop_damage')
      ]);
      setFarms(fData);
      setCropReports(rData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegisterFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName || !locationName) {
      alert('Please fill farm name and location');
      return;
    }

    try {
      await api.registerFarm({
        owner_id: user?.uid || 'USR-FARMER-DEMO',
        owner_name: user?.displayName || 'Registered Farmer',
        farm_name: farmName,
        location_name: locationName,
        latitude: 11.9842,
        longitude: 76.0125,
        size_acres: parseFloat(sizeAcres) || 5.0,
        crops: cropsInput.split(',').map((s) => s.trim()),
        primary_wildlife_threats: threatsInput.split(',').map((s) => s.trim()),
        contact_phone: phone
      });
      setStatusMessage('Farm successfully registered in the early warning grid!');
      setShowRegisterModal(false);
      loadData();
    } catch (err: any) {
      alert('Registration error: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <Tractor className="w-4 h-4 text-amber-600" />
            <span>Agricultural Conflict Mitigation</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Crop Protection Desk</h1>
          <p className="text-sm text-slate-600">
            Early intruder detection, bio-acoustic deterrent guidance and official crop damage compensation support.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition flex items-center space-x-2 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Farm Plot</span>
        </button>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3 rounded-xl flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Grid: Registered Farms & Damage Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Farms & Incident Reports */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Registered Buffer Zone Farms ({farms.length})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {farms.map((farm) => (
                <div key={farm.farm_id} className="p-4 bg-amber-50/50 border border-amber-200/70 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{farm.farm_name}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded">
                      {farm.size_acres} Acres
                    </span>
                  </div>
                  <div className="text-slate-600">Location: <strong>{farm.location_name}</strong></div>
                  <div>
                    <span className="text-slate-500">Crops:</span>{' '}
                    <span className="font-medium text-slate-800">{farm.crops.join(', ')}</span>
                  </div>
                  <div className="text-[11px] text-rose-800 font-medium">
                    Threats: {farm.primary_wildlife_threats.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Crop Damage Incidents */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Verified Crop Incidents & Claims ({cropReports.length})</span>
            </h2>

            <div className="space-y-3">
              {cropReports.map((r) => (
                <div key={r.report_id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{r.title}</span>
                    <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{r.description}</p>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Species: <strong>{r.species}</strong> • {r.location_name}</span>
                    <span>Assigned: {r.assigned_team || 'Pending Forest Review'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Humane Mitigation Guide & Govt Compensation Scheme */}
        <div className="space-y-6">
          <div className="bg-emerald-950 text-white p-6 rounded-2xl border border-emerald-900 space-y-4">
            <h3 className="font-bold text-base text-emerald-300">
              Humane & Non-Lethal Deterrents
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Scientific deterrents that safeguard crops without causing animal injury or legal liability:
            </p>

            <ul className="space-y-2.5 text-xs text-emerald-200">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Solar Strobe Flashers:</strong> Intermittent flashing LED perimeter lights disrupt nocturnal wild boar and deer paths.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Chilli-Dung Ropes:</strong> Natural organic repellent ropes strung along elephant trails steer pachyderms away.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Beehive Fencing:</strong> Natural biological deterrent that elephants naturally avoid while boosting pollination.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Bio-Acoustic Buzzers:</strong> High-frequency sound arrays triggered on IoT perimeter detection.</span>
              </li>
            </ul>

            <div className="bg-rose-950/60 border border-rose-800 p-3 rounded-xl text-[11px] text-rose-200">
              <strong>STRICT WARNING:</strong> Live wire electrocution, deliberate poisoning, or explosive baits (avittukai)
              are criminal non-bailable offenses under Section 9 of the Wildlife Protection Act, 1972.
            </div>
          </div>

          {/* Government Compensation Claims Box */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Government Crop Damage Relief</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Forest Departments provide ex-gratia relief for verified wildlife damage to standing crops
              (Paddy, Sugarcane, Maize, Coffee, Arecanut, Banana):
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-slate-700">
              <div>• Karnataka Aranya Compensation Portal (e-Parihara)</div>
              <div>• Maximum relief up to ₹50,000 / hectare based on crop evaluation</div>
              <div>• File report within 48 hours with geo-tagged photographs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Farm Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Register Farm Plot</h3>
            <form onSubmit={handleRegisterFarm} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Farm Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. Kaveri Agro Plantation"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Approximate Location / Village</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Kutta Village, Virajpet Taluk"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Size (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sizeAcres}
                    onChange={(e) => setSizeAcres(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cultivated Crops</label>
                <input
                  type="text"
                  value={cropsInput}
                  onChange={(e) => setCropsInput(e.target.value)}
                  placeholder="Comma separated: Maize, Coffee, Banana"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Primary Wildlife Threats</label>
                <input
                  type="text"
                  value={threatsInput}
                  onChange={(e) => setThreatsInput(e.target.value)}
                  placeholder="e.g. Wild Boar, Elephant"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg shadow"
                >
                  Save Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
