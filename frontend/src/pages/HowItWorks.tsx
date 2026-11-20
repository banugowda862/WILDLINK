import React from 'react';
import { Cpu, Radio, ShieldCheck, Bell, Activity, Eye, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
          <Activity className="w-4 h-4" />
          <span>End-to-End System Engineering</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">How WILDLINK Operates</h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          From thermal sensor acquisition on Raspberry Pi edge hardware to cloud API verification and public warning dispatch.
        </p>
      </div>

      <div className="space-y-6">
        {[
          {
            num: '1',
            icon: '📡',
            title: 'Thermal Sensor Acquisition (MLX90640)',
            desc: 'The solar-powered edge sentinel node reads 768 far-infrared pixels across a 32×24 grid at 4 Hz over I2C (400kHz). It operates in complete darkness, fog or rain without emitting flash or disturbing wildlife.'
          },
          {
            num: '2',
            icon: '⚡',
            title: 'Edge Processing & Heat Clustering',
            desc: 'Python routines on the Raspberry Pi compute ambient background medians, isolate warm biological thermal masses (32°C–39°C), group contiguous candidate pixels, and filter sensor noise.'
          },
          {
            num: '3',
            icon: '🧠',
            title: 'Interchangeable AI Detection Pipeline',
            desc: 'Candidate heat masses are evaluated for spatial movement consistency and classified into candidate profiles (e.g. large mammal / quadruped / avian) with confidence scores. Duplicate suppression prevents repeated alerts.'
          },
          {
            num: '4',
            icon: '🔒',
            title: 'Secure FastAPI Backend Transmission',
            desc: 'Events are transmitted via authenticated REST API endpoints using per-device tokens and HMAC verification. Offline queues handle temporary remote forest cellular dropouts.'
          },
          {
            num: '5',
            icon: '🛡️',
            title: 'Forest Officer Human Verification',
            desc: 'Authorized range officers review candidates on the Officer Hub. Officers verify sightings, dispatch mobile response squads, and approve public warning distributions.'
          },
          {
            num: '6',
            icon: '🗺️',
            title: 'Privacy-Aware Public Map & Alerts',
            desc: 'Active road crossings and crop warnings appear on the Wildlife Safety Map with privacy-aware generalized positions (~800m offset), warning drivers to reduce speed and farmers to activate humane acoustic deterrents.'
          }
        ].map((step, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shrink-0">
              {step.icon}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-emerald-700">STAGE {step.num}</div>
              <h3 className="font-bold text-slate-900 text-base">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
