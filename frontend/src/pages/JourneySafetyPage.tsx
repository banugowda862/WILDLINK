import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import type { Alert, RoadSafetyZone } from '../types';
import {
  Navigation,
  Car,
  AlertTriangle,
  ShieldCheck,
  Compass,
  MapPin,
  Gauge,
  PhoneCall,
  Radio,
  Eye,
  CheckCircle2,
  AlertOctagon,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';

interface RouteOption {
  id: string;
  name: string;
  highwayNo: string;
  stretch: string;
  startCoords: [number, number];
  endCoords: [number, number];
  waypoints: [number, number][];
  defaultSpeedLimit: number;
}

const PREDEFINED_ROUTES: RouteOption[] = [
  {
    id: 'nh-766-bandipur',
    name: 'NH-766 Mysore - Gundlupet - Wayanad Highway',
    highwayNo: 'NH-766',
    stretch: 'Bandipur National Park Forest Corridor (Km 20 - Km 38)',
    startCoords: [11.8010, 76.6850],
    endCoords: [11.6320, 76.5820],
    waypoints: [
      [11.8010, 76.6850], // Gundlupet exit
      [11.7340, 76.6520], // Forest entry gate
      [11.6664, 76.6291], // Core wildlife corridor post A1
      [11.6490, 76.6110], // Moolehole checkpost
      [11.6320, 76.5820]  // Wayanad / Kerala state border
    ],
    defaultSpeedLimit: 30
  },
  {
    id: 'sh-33-nagarhole',
    name: 'SH-33 Mananthavady - Hunsur - Mysore Highway',
    highwayNo: 'SH-33',
    stretch: 'Nagarhole Tiger Reserve Buffer (Bavali Checkpost - Antharasanthe)',
    startCoords: [12.0300, 76.1500],
    endCoords: [11.8900, 76.2400],
    waypoints: [
      [12.0300, 76.1500],
      [11.9842, 76.1200],
      [11.9500, 76.1800],
      [11.8900, 76.2400]
    ],
    defaultSpeedLimit: 30
  },
  {
    id: 'bannerghatta-forest-road',
    name: 'Bannerghatta - Ragihalli Forest Valley Road',
    highwayNo: 'B-ROAD-4',
    stretch: 'Bannerghatta Elephant Corridor Sector (Kalkere - Ragihalli)',
    startCoords: [12.8050, 77.5750],
    endCoords: [12.7480, 77.5620],
    waypoints: [
      [12.8050, 77.5750],
      [12.7820, 77.5710],
      [12.7600, 77.5670],
      [12.7480, 77.5620]
    ],
    defaultSpeedLimit: 25
  }
];

export const JourneySafetyPage: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('nh-766-bandipur');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [zones, setZones] = useState<RoadSafetyZone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [journeyActive, setJourneyActive] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [speedKmh, setSpeedKmh] = useState<number>(28);
  const [activeAlertInRange, setActiveAlertInRange] = useState<Alert | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const alertLayersRef = useRef<L.LayerGroup | null>(null);

  const selectedRoute = PREDEFINED_ROUTES.find((r) => r.id === selectedRouteId) || PREDEFINED_ROUTES[0];

  // Fetch alerts and zones
  const loadSafetyData = async () => {
    try {
      const [aData, zData] = await Promise.all([
        api.getAlerts(true, true),
        api.getRoadZones()
      ]);
      setAlerts(aData);
      setZones(zData);
    } catch (err) {
      console.error('Failed to load journey alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSafetyData();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: selectedRoute.waypoints[2] || selectedRoute.waypoints[0],
        zoom: 12,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      alertLayersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Route Polyline & View when route changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
    }

    // Draw route corridor line
    routePolylineRef.current = L.polyline(selectedRoute.waypoints, {
      color: '#2563eb',
      weight: 6,
      opacity: 0.85,
      dashArray: '10, 8'
    }).addTo(map);

    map.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50] });

    // Set initial driver position at start of route if journey active
    if (journeyActive && !currentPosition) {
      setCurrentPosition(selectedRoute.waypoints[0]);
    }
  }, [selectedRouteId]);

  // Update Alert Overlays on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !alertLayersRef.current) return;
    const alertGroup = alertLayersRef.current;
    alertGroup.clearLayers();

    // Check which alerts fall within route corridor
    let matchedAlert: Alert | null = null;

    alerts.forEach((alert) => {
      if (!alert.is_active) return;

      // Calculate distance to route waypoints (simple minimum dist)
      const isNearRoute = selectedRoute.waypoints.some((pt) => {
        const dLat = pt[0] - alert.latitude;
        const dLng = pt[1] - alert.longitude;
        const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
        return distKm < (alert.radius_km || 5) + 3;
      });

      if (isNearRoute) {
        matchedAlert = alert;
      }

      // Draw alert circle
      const circle = L.circle([alert.latitude, alert.longitude], {
        radius: (alert.radius_km || 3) * 1000,
        color: alert.severity === 'danger' || alert.severity === 'critical' ? '#e11d48' : '#d97706',
        fillColor: alert.severity === 'danger' || alert.severity === 'critical' ? '#f43f5e' : '#f59e0b',
        fillOpacity: 0.25,
        weight: 2
      });

      const iconHtml = `
        <div style="background-color: #e11d48; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
          <span style="font-size: 16px;">⚠️</span>
        </div>
      `;

      const alertIcon = L.divIcon({
        className: 'custom-alert-icon',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([alert.latitude, alert.longitude], { icon: alertIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <div style="color: #e11d48; font-weight: bold; font-size: 13px;">${alert.title}</div>
          <p style="margin: 4px 0;">${alert.message}</p>
          <div style="color: #64748b; font-size: 10px;">Area: ${alert.area_name}</div>
        </div>
      `);

      alertGroup.addLayer(circle);
      alertGroup.addLayer(marker);
    });

    setActiveAlertInRange(matchedAlert);
  }, [alerts, selectedRouteId]);

  // Update Driver Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (currentPosition) {
      if (!userMarkerRef.current) {
        const carIcon = L.divIcon({
          className: 'custom-car-icon',
          html: `
            <div style="background-color: #0284c7; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(2,132,199,0.5);">
              <span style="font-size: 20px;">🚗</span>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });
        userMarkerRef.current = L.marker(currentPosition, { icon: carIcon }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng(currentPosition);
      }
    } else {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
    }
  }, [currentPosition]);

  // Start Journey Mode
  const startJourney = () => {
    setJourneyActive(true);
    setGpsError(null);

    // Try real geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // If browser returns real GPS, check if user is far from route
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          // In classroom, if real coords are far from Western Ghats, anchor to route starting point
          const dLat = Math.abs(lat - selectedRoute.waypoints[0][0]);
          if (dLat > 1.5) {
            // Classroom demo mode fallback
            setCurrentPosition(selectedRoute.waypoints[1]);
          } else {
            setCurrentPosition([lat, lng]);
          }
        },
        (err) => {
          console.warn('Geolocation failed or denied, using simulated route location', err.message);
          setCurrentPosition(selectedRoute.waypoints[1]);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setCurrentPosition(selectedRoute.waypoints[1]);
    }
  };

  const stopJourney = () => {
    setJourneyActive(false);
    setCurrentPosition(null);
  };

  const advancePositionToDangerZone = () => {
    if (!journeyActive) setJourneyActive(true);
    // Jump car right next to Bandipur corridor post A1 where elephant detection is active
    setCurrentPosition([11.6664, 76.6291]);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([11.6664, 76.6291], 14, { duration: 1.5 });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-700">
            <Navigation className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>Driver Early Warning & Journey Mode</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Traveller Highway Safety</h1>
          <p className="text-sm text-slate-600">
            Live corridor collision avoidance, real-time speed advisory and roadside wildlife presence alerts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {!journeyActive ? (
            <button
              onClick={startJourney}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition"
            >
              <Compass className="w-4 h-4" />
              <span>Start Journey Mode</span>
            </button>
          ) : (
            <button
              onClick={stopJourney}
              className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow transition"
            >
              <span>Exit Journey Mode</span>
            </button>
          )}

          <button
            onClick={advancePositionToDangerZone}
            className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition shadow"
            title="Simulate driving into verified animal crossing area for classroom testing"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Entering Risk Stretch</span>
          </button>
        </div>
      </div>

      {/* High-Impact Driver Alert Banner (If alert in range) */}
      {activeAlertInRange ? (
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white p-6 rounded-3xl border-2 border-rose-500 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-700/60 pb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-rose-500/30 p-2.5 rounded-2xl ring-2 ring-rose-400">
                <AlertOctagon className="w-8 h-8 text-rose-300 animate-bounce" />
              </div>
              <div>
                <span className="bg-rose-600/80 uppercase text-[11px] font-black px-2.5 py-0.5 rounded-full tracking-wider">
                  Verified Danger Zone Ahead
                </span>
                <h2 className="text-2xl font-black text-rose-50 mt-1">{activeAlertInRange.title}</h2>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm bg-black/30 px-4 py-2.5 rounded-2xl border border-rose-400/30">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-300 block">Corridor Sector</span>
                <span className="font-bold text-white">{activeAlertInRange.area_name}</span>
              </div>
              <div className="h-6 w-px bg-rose-500/40" />
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-300 block">Strict Speed Cap</span>
                <span className="font-extrabold text-amber-300 text-lg">30 km/h</span>
              </div>
            </div>
          </div>

          <p className="text-rose-100 text-base leading-relaxed font-medium">
            {activeAlertInRange.message}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center space-x-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Remain inside vehicle with windows up</span>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center space-x-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Do NOT honk or use high-beam lights</span>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center space-x-2 text-xs">
              <Eye className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>Maintain 50m minimum animal distance</span>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center space-x-2 text-xs">
              <PhoneCall className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Forest Patrol SOS: <strong>1800-425-4554</strong></span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950 text-emerald-100 p-5 rounded-2xl border border-emerald-800 shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h4 className="font-bold text-sm text-emerald-50">Forest Route Clear</h4>
              <p className="text-xs text-emerald-300">
                No active large herd highway crossings currently verified along this corridor. Maintain regular forest speed limit (30 km/h).
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block bg-emerald-900 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-700">
            Thermal Nodes Online
          </span>
        </div>
      )}

      {/* Main Grid: Map & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Route selector & Driver Telemetry */}
        <div className="space-y-6 lg:col-span-1">
          {/* Route Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Car className="w-4 h-4 text-slate-700" />
              <span>Select Travel Corridor</span>
            </h3>

            <div className="space-y-2">
              {PREDEFINED_ROUTES.map((route) => (
                <button
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition ${
                    selectedRouteId === route.id
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-600">{route.highwayNo}</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      Cap: {route.defaultSpeedLimit} km/h
                    </span>
                  </div>
                  <div className="font-bold text-sm text-slate-900 mt-1">{route.name}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{route.stretch}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry & Speed Indicator */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Driver Telemetry</span>
              </div>
              <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${journeyActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${journeyActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <span>{journeyActive ? 'GPS ACTIVE' : 'STANDBY'}</span>
              </span>
            </div>

            <div className="flex items-center justify-around py-2">
              <div className="text-center">
                <span className="text-3xl font-black text-white">{speedKmh}</span>
                <span className="text-xs text-slate-400 block font-semibold">km/h Speed</span>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-3xl font-black text-amber-400">{selectedRoute.defaultSpeedLimit}</span>
                <span className="text-xs text-slate-400 block font-semibold">Max Advisory</span>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-3xl font-black text-rose-400">₹5K</span>
                <span className="text-xs text-slate-400 block font-semibold">Speed Penalty</span>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nocturnal Traffic Curfew</span>
                </span>
                <strong className="text-amber-300 font-bold">9:00 PM – 6:00 AM</strong>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                All non-emergency private transit through core Bandipur / Nagarhole corridors is shut overnight to ensure undisturbed animal migration.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Route Map */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">{selectedRoute.name}</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Blue dashed line: Highway Corridor Buffer (5km)
            </span>
          </div>

          <div
            ref={mapContainerRef}
            className="w-full flex-1 min-h-[460px] rounded-xl overflow-hidden border border-slate-200 z-0"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                <span>Travel Corridor</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span>Wildlife Crossing Alert</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span>Caution Buffer</span>
              </span>
            </div>

            <div className="text-[11px] text-slate-400">
              Emergency Forest Range Police: <strong className="text-slate-700">0821-2480901</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
