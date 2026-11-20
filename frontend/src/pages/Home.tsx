import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  MapPin,
  AlertTriangle,
  Tractor,
  Car,
  HeartHandshake,
  Compass,
  Cpu,
  Eye,
  CheckCircle2,
  ArrowRight,
  Flame,
  Radio,
  Users,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import type { Alert, IncidentReport } from '../types';

export const Home: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [alertsData, reportsData] = await Promise.all([
          api.getAlerts(true, true),
          api.getReports()
        ]);
        setAlerts(alertsData.slice(0, 3));
        setReports(reportsData.slice(0, 4));
      } catch (e) {
        console.error('Error loading home data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-800/80 border border-emerald-600/40 text-emerald-200 text-xs font-semibold px-4 py-1.5 rounded-full shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Integrated Wildlife Protection & Human Coexistence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Protect Wildlife. Protect People.{' '}
            <span className="text-emerald-400 block sm:inline">Preserve Nature.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
            An intelligent platform connecting communities, IoT thermal cameras, AI-assisted early detection
            and conservation teams to prevent human–wildlife conflict, detect threats early and protect biodiversity.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/report"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center space-x-2 text-base"
            >
              <AlertTriangle className="w-5 h-5 text-slate-950" />
              <span>Report a Wildlife Threat</span>
            </Link>

            <Link
              to="/map"
              className="bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 font-semibold px-7 py-3.5 rounded-xl shadow transition flex items-center space-x-2 text-base"
            >
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>Explore Safety Alerts</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-slate-900/60 backdrop-blur border border-emerald-800/40 p-4 rounded-xl">
              <div className="text-2xl font-black text-emerald-400">4 Forests</div>
              <div className="text-xs text-slate-300">Bandipur, Nagarhole, Wayanad & Hassan fringe</div>
            </div>
            <div className="bg-slate-900/60 backdrop-blur border border-emerald-800/40 p-4 rounded-xl">
              <div className="text-2xl font-black text-amber-400">32×24 IR</div>
              <div className="text-xs text-slate-300">MLX90640 thermal sensor integration</div>
            </div>
            <div className="bg-slate-900/60 backdrop-blur border border-emerald-800/40 p-4 rounded-xl">
              <div className="text-2xl font-black text-cyan-400">&lt; 30 min</div>
              <div className="text-xs text-slate-300">Average response dispatch time</div>
            </div>
            <div className="bg-slate-900/60 backdrop-blur border border-emerald-800/40 p-4 rounded-xl">
              <div className="text-2xl font-black text-rose-400">100% Non-Lethal</div>
              <div className="text-xs text-slate-300">Strictly humane coexistence guidance</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE ACTIVE SAFETY ALERTS (From Database Only) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Real-Time Caution</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Active Safety Advisories</h2>
          </div>
          <Link to="/map" className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center space-x-1">
            <span>View Full Interactive Map</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {alerts.map((alert) => (
            <div
              key={alert.alert_id}
              className={`p-5 rounded-2xl border transition shadow-sm hover:shadow-md flex flex-col justify-between ${
                alert.severity === 'critical'
                  ? 'bg-rose-50/70 border-rose-200'
                  : alert.severity === 'warning'
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    alert.severity === 'critical'
                      ? 'bg-rose-200 text-rose-900'
                      : alert.severity === 'warning'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}>
                    {alert.alert_type.replace('_', ' ')}
                  </span>
                  {alert.simulated && (
                    <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                      DEMO DATA
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">{alert.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-3">{alert.message}</p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 mt-4 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{alert.area_name}</span>
                </span>
                <Link to="/map" className="font-semibold text-emerald-800 hover:underline">
                  Locate →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS: 6-STAGE COEXISTENCE LIFECYCLE */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Operational Architecture</div>
          <h2 className="text-3xl font-extrabold text-white">How WILDLINK Works</h2>
          <p className="text-sm text-slate-300">
            From sensor acquisition and citizen reporting to rapid verification and coordinated field response.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { step: '01', title: 'Detection', desc: 'Thermal camera arrays (MLX90640) & citizen observations grab heat and visual signals.' },
            { step: '02', title: 'Processing', desc: 'Noise filtering, temperature thresholding and AI candidate object clustering.' },
            { step: '03', title: 'Verification', desc: 'Authorised forest officers evaluate candidate events before wide public broadcast.' },
            { step: '04', title: 'Risk Assess', desc: 'Spatial buffers determine if highways, farmlands or school zones are threatened.' },
            { step: '05', title: 'Alert & Notice', desc: 'Targeted warnings delivered to drivers, farmers and emergency dispatch teams.' },
            { step: '06', title: 'Monitoring', desc: 'Continuous telemetry, resolution logging and historical conflict trend tracking.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-800/70 border border-slate-700/60 p-4 rounded-xl flex flex-col justify-between">
              <div className="text-emerald-400 font-mono text-xs font-black mb-2">{item.step}</div>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. THE 8 COEXISTENCE MODULES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Ecosystem Coverage</div>
          <h2 className="text-3xl font-extrabold text-slate-900">Comprehensive Wildlife Protection Modules</h2>
          <p className="text-sm text-slate-600">
            WILDLINK connects all stakeholders with specialized humane mitigation workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/crop-protection"
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Tractor className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Crop Protection</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Farmer farm registration, crop damage reporting, humane deterrents & legal compensation guidance.
            </p>
          </Link>

          <Link
            to="/road-alerts"
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Road & Rail Safety</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Highway crossing advisories, reduced speed limits, vehicle driver caution and roadkill reporting.
            </p>
          </Link>

          <Link
            to="/rescue"
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Wildlife Rescue</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Injured, trapped or orphaned animals, snake relocation and wildlife veterinarian emergency dispatch.
            </p>
          </Link>

          <Link
            to="/sightings"
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Village Sightings</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Notices near homes, villages, schools and towns to avoid panic and keep residents safe.
            </p>
          </Link>

          <Link
            to="/environmental-threats"
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Forest Fires & Crime</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Illegal snares, poaching, deforestation, water scarcity and dry season forest fire alerts.
            </p>
          </Link>

          <Link
            to="/officer/monitoring"
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Thermal IoT Cameras</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Low-power Raspberry Pi edge sensors with MLX90640 far-infrared heat profiling and telemetry.
            </p>
          </Link>

          <Link
            to="/map"
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Privacy-First Maps</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dual-layer geospatial interface protecting sensitive species coordinates from public exposure.
            </p>
          </Link>

          <Link
            to="/volunteer"
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Community Network</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mobilising vetted volunteers, local NGOs, conservationists and panchayat coexistence leaders.
            </p>
          </Link>
        </div>
      </section>

      {/* 5. TECHNOLOGY SPOTLIGHT: THERMAL IMAGING & RASPBERRY PI */}
      <section className="bg-slate-100 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">Edge Hardware Architecture</div>
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
              Non-Invasive Night Vision Monitoring via Thermal Infrared Arrays
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              Most human–wildlife conflict occurs under cover of darkness when optical cameras fail without intrusive spotlights
              that disorient animals. WILDLINK integrates <strong>MLX90640 32×24 far-infrared thermal sensors</strong> running
              on solar-powered Raspberry Pi edge nodes.
            </p>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>No Light Disturbance:</strong> Passively senses 768 ambient thermal signatures without frightening elephants or predators.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Ethical AI Guardrails:</strong> Heat clusters are tagged strictly as <em>candidates</em>; human verification is required before triggering public alerts.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Resilient Telemetry:</strong> Offline queueing and automatic retries during patchy remote jungle cellular coverage.</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/officer/monitoring"
                className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-800 hover:text-emerald-700 underline"
              >
                <span>View Thermal Grid Visualizer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Visual Thermal Representation Card */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-semibold text-slate-200">WILDLINK-ROAD-001 (Thermal Array)</span>
              </div>
              <span className="text-[10px] bg-emerald-900 text-emerald-300 font-mono px-2 py-0.5 rounded">
                LIVE TELEMETRY
              </span>
            </div>

            {/* Synthetic Thermal Heat Matrix Preview */}
            <div className="grid grid-cols-8 gap-1.5 p-4 bg-slate-900 rounded-2xl border border-slate-800">
              {Array.from({ length: 32 }).map((_, i) => {
                const isCenter = [10, 11, 12, 18, 19, 20].includes(i);
                return (
                  <div
                    key={i}
                    className={`h-7 rounded flex items-center justify-center font-mono text-[9px] ${
                      isCenter
                        ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
                        : 'bg-emerald-950/80 text-emerald-400'
                    }`}
                  >
                    {isCenter ? '36.4°' : '22.1°'}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Ambient: 22.4°C</span>
              <span className="text-amber-400 font-bold">Candidate Peak: 36.8°C</span>
              <span>Status: HEALTHY</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RECENT COMMUNITY INCIDENT FEED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Citizen Coexistence Reports</div>
            <h2 className="text-2xl font-extrabold text-slate-900">Recent Community Submissions</h2>
          </div>
          <Link to="/report" className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
            + Submit Report
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((rep) => (
            <div key={rep.report_id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold uppercase text-slate-500">{rep.category.replace('_', ' ')}</span>
                  <span className={`px-1.5 py-0.5 rounded font-semibold ${
                    rep.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {rep.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{rep.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{rep.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{rep.location_name}</span>
                <span className="font-semibold text-slate-700">{rep.species}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. ETHICAL CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-4 bg-emerald-900 text-white p-10 rounded-3xl shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Join the Humane Wildlife Protection Network</h2>
        <p className="max-w-2xl mx-auto text-sm text-emerald-100 leading-relaxed">
          Whether you are a farmer safeguarding harvests, a driver traveling through forest highways,
          or a volunteer rescuer, WILDLINK gives you the real-time tools to live safely alongside nature.
        </p>
        <div className="pt-3 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="bg-white text-emerald-950 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-100 transition text-sm"
          >
            Create Free Account
          </Link>
          <Link
            to="/awareness"
            className="bg-emerald-800 text-emerald-100 border border-emerald-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition text-sm"
          >
            Read Safety Manual
          </Link>
        </div>
      </section>
    </div>
  );
};
