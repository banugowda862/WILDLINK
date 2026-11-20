import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { IncidentReport, Alert, MonitoringDevice, Detection } from '../types';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, AlertTriangle, Filter, CheckCircle, Radio } from 'lucide-react';

interface LeafletMapProps {
  reports?: IncidentReport[];
  alerts?: Alert[];
  devices?: MonitoringDevice[];
  detections?: Detection[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  allowLayerSwitch?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  reports = [],
  alerts = [],
  devices = [],
  detections = [],
  center = [11.85, 76.35], // Bandipur - Nagarhole Western Ghats Corridor
  zoom = 10,
  height = '560px',
  allowLayerSwitch = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const { isOfficer } = useAuth();
  const [restrictedView, setRestrictedView] = useState(isOfficer);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Keep restricted view synced if officer status changes
  useEffect(() => {
    if (!isOfficer) {
      setRestrictedView(false);
    }
  }, [isOfficer]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true
      });

      // OpenStreetMap standard tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers based on mode and filters
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Helper: Jitter approximate location for public map
    const getDisplayCoordinates = (lat: number, lng: number, seed: string): [number, number] => {
      if (restrictedView && isOfficer) {
        return [lat, lng]; // Exact coordinates for authorized officers
      }
      // Public view: add deterministic ~500-800m privacy offset
      const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const deltaLat = ((hash % 100) - 50) * 0.00015;
      const deltaLng = (((hash * 7) % 100) - 50) * 0.00015;
      return [lat + deltaLat, lng + deltaLng];
    };

    // 1. Render Active Safety Alerts (Circles & Polygons)
    alerts.forEach((alert) => {
      if (!alert.is_active) return;
      if (filterCategory !== 'all' && filterCategory !== 'alerts') return;

      const [lat, lng] = [alert.latitude, alert.longitude];
      const color = alert.severity === 'critical' ? '#e11d48' : alert.severity === 'high' ? '#ea580c' : '#d97706';

      // Alert Warning Zone Circle
      const circle = L.circle([lat, lng], {
        radius: (alert.radius_km || 4) * 1000,
        color,
        fillColor: color,
        fillOpacity: 0.18,
        weight: 2,
        dashArray: alert.simulated ? '4, 4' : undefined
      });

      circle.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; max-width: 240px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: ${color}; text-transform: uppercase; font-size: 10px;">${alert.alert_type.replace('_', ' ')}</strong>
            ${alert.simulated ? '<span style="background: #fef3c7; color: #92400e; font-size: 9px; padding: 1px 4px; border-radius: 4px;">DEMO</span>' : ''}
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold;">${alert.title}</h4>
          <p style="margin: 0 0 6px 0; color: #475569;">${alert.message}</p>
          <div style="font-size: 10px; color: #64748b;">Area: ${alert.area_name}</div>
        </div>
      `);

      circle.on('click', () => setSelectedItem(alert));
      markersLayerRef.current?.addLayer(circle);
    });

    // 2. Render Incident Reports
    reports.forEach((report) => {
      if (filterCategory !== 'all' && filterCategory !== report.category) return;

      const [lat, lng] = getDisplayCoordinates(report.latitude, report.longitude, report.report_id);

      // Icon colors based on category
      const isVerified = report.status === 'verified' || report.status === 'assigned' || report.status === 'resolved';
      const markerColor = isVerified ? '#059669' : '#d97706';

      const customIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="
            background: ${markerColor};
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            font-size: 11px;
            font-weight: bold;
          ">
            ${report.species.charAt(0).toUpperCase()}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; max-width: 260px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; color: ${markerColor}; text-transform: uppercase;">
              ${report.category.replace('_', ' ')}
            </span>
            <span style="font-size: 10px; background: #e2e8f0; padding: 1px 4px; border-radius: 4px;">
              ${report.status.replace('_', ' ')}
            </span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold;">${report.title}</h4>
          <p style="margin: 0 0 6px 0; color: #334155;">${report.description}</p>
          <div style="font-size: 10px; color: #64748b;">
            Species: <strong>${report.species}</strong><br/>
            Location: ${report.location_name}<br/>
            ${restrictedView && isOfficer ? `<span style="color: #059669;">[OFFICER] Exact GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}</span>` : '<span style="color: #64748b;">[PUBLIC] Approximate Area</span>'}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => setSelectedItem(report));
      markersLayerRef.current?.addLayer(marker);
    });

    // 3. Render Monitoring Devices (ONLY on Restricted Officer Map for security)
    if (restrictedView && isOfficer) {
      devices.forEach((dev) => {
        if (filterCategory !== 'all' && filterCategory !== 'devices') return;

        const devIcon = L.divIcon({
          className: 'custom-device-icon',
          html: `
            <div style="
              background: ${dev.status === 'online' ? '#0284c7' : dev.status === 'warning' ? '#f59e0b' : '#64748b'};
              color: white;
              width: 26px;
              height: 26px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
              font-size: 12px;
            ">
              📡
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const devMarker = L.marker([dev.latitude, dev.longitude], { icon: devIcon });
        devMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; max-width: 240px;">
            <div style="font-size: 10px; font-weight: bold; color: #0284c7; text-transform: uppercase;">
              [RESTRICTED] IoT SENSOR POST
            </div>
            <h4 style="margin: 2px 0 4px 0; font-size: 13px; font-weight: bold;">${dev.name}</h4>
            <div style="font-size: 10px; color: #334155; line-height: 1.4;">
              ID: <strong>${dev.device_id}</strong><br/>
              Status: <strong style="color: ${dev.status === 'online' ? '#16a34a' : '#ea580c'}">${dev.status.toUpperCase()}</strong><br/>
              Battery: ${dev.battery_level}% (Solar)<br/>
              Thermal Sensor: ${dev.thermal_sensor_status}<br/>
              Exact GPS: ${dev.latitude.toFixed(5)}, ${dev.longitude.toFixed(5)}
            </div>
          </div>
        `);

        devMarker.on('click', () => setSelectedItem(dev));
        markersLayerRef.current?.addLayer(devMarker);
      });
    }
  }, [reports, alerts, devices, detections, restrictedView, filterCategory, isOfficer]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white">
      {/* Top Map Control Bar */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-20">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-300">Filter View:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Layers</option>
            <option value="alerts">Active Warnings & Zones</option>
            <option value="animal_crossing">Road Wildlife Crossings</option>
            <option value="crop_damage">Crop Conflict Reports</option>
            <option value="injured_animal">Animal Rescue Cases</option>
            {isOfficer && <option value="devices">Thermal Monitoring Devices</option>}
          </select>
        </div>

        {/* Public vs Restricted Officer Map Toggle */}
        {allowLayerSwitch && (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Privacy Layer:</span>
            {isOfficer ? (
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                <button
                  onClick={() => setRestrictedView(false)}
                  className={`px-2 py-1 rounded text-xs transition ${
                    !restrictedView ? 'bg-emerald-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3 inline mr-1" />
                  Public Map
                </button>
                <button
                  onClick={() => setRestrictedView(true)}
                  className={`px-2 py-1 rounded text-xs transition flex items-center space-x-1 ${
                    restrictedView ? 'bg-rose-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>Officer Restricted</span>
                </button>
              </div>
            ) : (
              <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2 py-1 rounded text-[11px] flex items-center space-x-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Public Privacy-Aware Mode (Coordinates Generalised)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Element */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-md text-[11px] z-30 max-w-xs pointer-events-auto">
        <div className="font-bold text-slate-800 mb-1.5 flex items-center justify-between">
          <span>Map Legend</span>
          {restrictedView && (
            <span className="text-[9px] bg-rose-100 text-rose-800 font-semibold px-1 py-0.5 rounded">
              OFFICER VIEW
            </span>
          )}
        </div>
        <div className="space-y-1 text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block border border-white shadow-sm"></span>
            <span>Verified Citizen Report</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-white shadow-sm"></span>
            <span>Pending Incident Verification</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/40 border border-rose-500 inline-block"></span>
            <span>Active Road/Crop Danger Corridor</span>
          </div>
          {restrictedView && (
            <div className="flex items-center space-x-2 pt-1 border-t border-slate-200 text-sky-800">
              <span className="w-3.5 h-3.5 rounded bg-sky-600 inline-block text-[8px] text-white text-center leading-none">
                📡
              </span>
              <span>Thermal IoT Camera (MLX90640)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
