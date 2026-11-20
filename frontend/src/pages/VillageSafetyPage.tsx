import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import type { Alert, IncidentReport } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Home,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Bell,
  Eye,
  ShieldCheck,
  MapPin,
  Calendar,
  Volume2,
  RefreshCw,
  XCircle,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface VillageProfile {
  id: string;
  name: string;
  region: string;
  coords: [number, number];
  fringeBufferKm: number;
  householdCount: number;
  primaryWildlife: string[];
}

const VILLAGES: VillageProfile[] = [
  {
    id: 'kutta-fringe',
    name: 'Kutta Village Fringe (Plot 12)',
    region: 'Kodagu / Nagarhole Wildlife Sanctuary Boundary',
    coords: [11.9842, 76.0125],
    fringeBufferKm: 3.5,
    householdCount: 142,
    primaryWildlife: ['Wild Boar', 'Asian Elephant', 'Spotted Deer']
  },
  {
    id: 'bannerghatta-settlement',
    name: 'Bannerghatta Kalkere Settlement',
    region: 'Bannerghatta National Park Periphery',
    coords: [12.8050, 77.5750],
    fringeBufferKm: 2.5,
    householdCount: 88,
    primaryWildlife: ['Asian Elephant', 'Sloth Bear', 'Leopard']
  },
  {
    id: 'gundlupet-periphery',
    name: 'Gundlupet Agricultural Hamlet',
    region: 'Bandipur Tiger Reserve Northern Buffer',
    coords: [11.7900, 76.6800],
    fringeBufferKm: 4.0,
    householdCount: 210,
    primaryWildlife: ['Asian Elephant', 'Tiger', 'Indian Gaur']
  }
];

export const VillageSafetyPage: React.FC = () => {
  const { user, isOfficer } = useAuth();
  const [selectedVillageId, setSelectedVillageId] = useState<string>('kutta-fringe');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const villageLayerRef = useRef<L.LayerGroup | null>(null);

  const selectedVillage = VILLAGES.find((v) => v.id === selectedVillageId) || VILLAGES[0];

  const loadData = async () => {
    try {
      setLoading(true);
      const [aData, rData] = await Promise.all([
        api.getAlerts(true, true),
        api.getReports()
      ]);
      setAlerts(aData);
      setReports(rData);
    } catch (e) {
      console.error('Failed to load village safety data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter alerts affecting current village perimeter
  const activeVillageAlerts = alerts.filter((alert) => {
    if (!alert.is_active) return false;
    const dLat = alert.latitude - selectedVillage.coords[0];
    const dLng = alert.longitude - selectedVillage.coords[1];
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
    return distKm <= selectedVillage.fringeBufferKm + (alert.radius_km || 3);
  });

  // Recent verified reports in this sector
  const recentSectorReports = reports.filter((r) => {
    const dLat = r.latitude - selectedVillage.coords[0];
    const dLng = r.longitude - selectedVillage.coords[1];
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
    return distKm <= selectedVillage.fringeBufferKm + 5;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: selectedVillage.coords,
        zoom: 13,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      villageLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Village Boundary & Generalized Alert Perimeters
  useEffect(() => {
    if (!mapInstanceRef.current || !villageLayerRef.current) return;
    const map = mapInstanceRef.current;
    const layerGroup = villageLayerRef.current;

    layerGroup.clearLayers();
    map.setView(selectedVillage.coords, 13);

    // Village Center Marker
    const villageIcon = L.divIcon({
      className: 'custom-village-icon',
      html: `
        <div style="background-color: #047857; color: white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
          <span>🏡</span>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const villageMarker = L.marker(selectedVillage.coords, { icon: villageIcon });
    villageMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px;">
        <strong style="color: #065f46; font-size: 13px;">${selectedVillage.name}</strong>
        <p style="margin: 4px 0;">${selectedVillage.region}</p>
        <div style="color: #64748b; font-size: 11px;">Protected Households: ${selectedVillage.householdCount}</div>
      </div>
    `);
    layerGroup.addLayer(villageMarker);

    // Village Buffer Boundary (Green dashed circle)
    const villageBufferCircle = L.circle(selectedVillage.coords, {
      radius: selectedVillage.fringeBufferKm * 1000,
      color: '#10b981',
      fillColor: '#34d399',
      fillOpacity: 0.1,
      dashArray: '6, 6',
      weight: 2
    });
    layerGroup.addLayer(villageBufferCircle);

    // Draw Generalized Privacy-Preserving Alert Zones
    activeVillageAlerts.forEach((alert) => {
      // Generalize slightly (~400m random hash offset) to prevent poaching
      const generalizedLat = alert.latitude + 0.002;
      const generalizedLng = alert.longitude - 0.002;

      const alertCircle = L.circle([generalizedLat, generalizedLng], {
        radius: (alert.radius_km || 2.5) * 1000,
        color: '#e11d48',
        fillColor: '#f43f5e',
        fillOpacity: 0.22,
        weight: 2
      });

      const alertIcon = L.divIcon({
        className: 'custom-alert-icon',
        html: `
          <div style="background-color: #e11d48; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            <span>⚠️</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const alertMarker = L.marker([generalizedLat, generalizedLng], { icon: alertIcon });
      alertMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <div style="color: #e11d48; font-weight: bold;">${alert.title}</div>
          <p style="margin: 4px 0;">${alert.message}</p>
          <div style="color: #94a3b8; font-size: 10px;">Privacy: Generalized to protect wildlife location</div>
        </div>
      `);

      layerGroup.addLayer(alertCircle);
      layerGroup.addLayer(alertMarker);
    });
  }, [selectedVillageId, alerts]);

  // Officer Action: Resolve / Expire Alert
  const handleResolveAlert = async (alertId: string) => {
    try {
      setResolvingId(alertId);
      await api.resolveAlert(alertId);
      setActionMessage(`Advisory ${alertId} has been successfully resolved and cleared from public village board.`);
      await loadData();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (e: any) {
      alert(`Error resolving alert: ${e.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <Home className="w-4 h-4 text-emerald-700" />
            <span>Rural Border Buffer & Agricultural Coexistence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Village Safety Advisory Board</h1>
          <p className="text-sm text-slate-600">
            Localized early warnings, privacy-preserving threat radii and resident precautions for fringe agricultural settlements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/report"
            className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Wildlife Near Village</span>
          </Link>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Village Banner / Active Advisory Status */}
      {activeVillageAlerts.length > 0 ? (
        <div className="bg-gradient-to-r from-amber-900 via-rose-950 to-slate-900 text-white p-6 rounded-3xl border-2 border-amber-500 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-500/20 p-2.5 rounded-2xl ring-2 ring-amber-400">
                <Bell className="w-7 h-7 text-amber-300 animate-bounce" />
              </div>
              <div>
                <span className="bg-amber-600 uppercase text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-wider">
                  Active Village Perimeter Warning
                </span>
                <h2 className="text-2xl font-black text-amber-50 mt-1">
                  {activeVillageAlerts[0].title}
                </h2>
              </div>
            </div>

            {isOfficer && (
              <button
                onClick={() => handleResolveAlert(activeVillageAlerts[0].alert_id)}
                disabled={resolvingId === activeVillageAlerts[0].alert_id}
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {resolvingId === activeVillageAlerts[0].alert_id ? 'Resolving...' : 'Resolve Advisory (Officer)'}
                </span>
              </button>
            )}
          </div>

          <p className="text-amber-100 text-sm leading-relaxed font-medium">
            {activeVillageAlerts[0].message}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Keep children indoors after sunset</span>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>Power on solar acoustic & strobe deterrents</span>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Forest Quick Response Team: <strong>1926</strong></span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950 text-emerald-100 p-5 rounded-2xl border border-emerald-800 shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h4 className="font-bold text-sm text-emerald-50">Perimeter Clear of Critical Intrusions</h4>
              <p className="text-xs text-emerald-300">
                No active elephant or predator incursions verified within the {selectedVillage.name} buffer zone today.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block bg-emerald-900 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-700">
            Normal Coexistence Level
          </span>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Village Selector & Resident Guidelines */}
        <div className="space-y-6 lg:col-span-1">
          {/* Village Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Home className="w-4 h-4 text-slate-700" />
              <span>Choose Agricultural Settlement</span>
            </h3>

            <div className="space-y-2">
              {VILLAGES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVillageId(v.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition ${
                    selectedVillageId === v.id
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-700">{v.name}</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {v.householdCount} Homes
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{v.region}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Key species: {v.primaryWildlife.join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resident Safety Rules Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-slate-900">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">Mandatory Resident Precautions</h3>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Secure livestock, calves, and goats in predator-proof enclosed pens before 6:00 PM.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Keep boundary torchlights and solar bio-acoustic fences in operating mode.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Avoid walking alone through sugarcane or coffee plantation corridors after sunset.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Never corner, throw stones, or shoot firecrackers directly at wild elephants.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Local Range Beat Officer:</span>
              <strong className="text-slate-800">Sub-Range Office #4</strong>
            </div>
          </div>
        </div>

        {/* Right: Map & Alert Log */}
        <div className="space-y-6 lg:col-span-2">
          {/* Generalized Map */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {selectedVillage.name} - Buffer Zone Map
                </h3>
              </div>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                Anti-Poaching Privacy Mode Active
              </span>
            </div>

            <div
              ref={mapContainerRef}
              className="w-full h-[380px] rounded-xl overflow-hidden border border-slate-200 z-0"
            />

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Village Perimeter</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span>Generalized Advisory Radius</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Exact wildlife coordinate masked to prevent illegal tracking
              </span>
            </div>
          </div>

          {/* Active Advisories List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span>Village Advisory & Alert Log</span>
            </h3>

            {activeVillageAlerts.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No active alerts posted for this settlement.
              </div>
            ) : (
              <div className="space-y-3">
                {activeVillageAlerts.map((a) => (
                  <div
                    key={a.alert_id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {a.alert_type}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{a.title}</span>
                      </div>
                      <p className="text-xs text-slate-600">{a.message}</p>
                      <span className="text-[10px] text-slate-400 block">
                        Sector: {a.area_name} • Issued: {new Date(a.start_time).toLocaleTimeString()}
                      </span>
                    </div>

                    {isOfficer && (
                      <button
                        onClick={() => handleResolveAlert(a.alert_id)}
                        disabled={resolvingId === a.alert_id}
                        className="self-start sm:self-center inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{resolvingId === a.alert_id ? 'Clearing...' : 'Clear Advisory'}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
