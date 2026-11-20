import React from 'react';
import { Shield, Heart, Eye, Cpu, Compass, Users } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
          <Shield className="w-4 h-4" />
          <span>Our Vision & Philosophy</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">About WILDLINK</h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          WILDLINK is an integrated wildlife protection and human–wildlife coexistence platform designed to
          protect rural communities, highway motorists, agricultural livelihoods and vulnerable biodiversity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            🌱
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Protect Wildlife</h3>
          <p className="text-slate-600 leading-relaxed">
            Eliminating retaliatory poisoning, live wire electrocution, and highway vehicle strikes through non-invasive
            early warning systems.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            👥
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Protect People</h3>
          <p className="text-slate-600 leading-relaxed">
            Empowering farmers and fringe village residents with actionable alerts, bio-acoustic deterrents and
            rapid emergency veterinary response.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
            🌍
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Preserve Nature</h3>
          <p className="text-slate-600 leading-relaxed">
            Protecting ecological corridors in the Western Ghats biodiversity hotspot, maintaining connected habitats
            for elephants, tigers, leopards and gaurs.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-4 text-xs leading-relaxed">
        <h3 className="text-lg font-bold text-emerald-400">The Technology & Ethics Foundation</h3>
        <p className="text-slate-300">
          Unlike conventional surveillance systems that rely on visible light floodlights or invasive tags,
          WILDLINK uses passive far-infrared thermal radiation detection. Thermal sensors (MLX90640) read
          microscopic temperature gradients without emitting flash or sound, ensuring animals remain undisturbed.
        </p>
        <p className="text-slate-300">
          All automated detections are treated as candidate hypotheses requiring qualified human forest officer
          verification before wide-area safety notices are published. Sensitive wildlife GPS locations are obscured
          on public maps to prevent wildlife crime and unauthorized tourism.
        </p>
      </div>
    </div>
  );
};
