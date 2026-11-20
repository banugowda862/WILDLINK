import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const AwarenessPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-xs">
      <div>
        <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
          <ShieldAlert className="w-4 h-4" />
          <span>Coexistence Safety Manual</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Wildlife Awareness & Safety Protocol
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Field-tested dos and don'ts for residents, farmers and travelers encountering wildlife in forest fringe zones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Asian Elephant */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">🐘 Asian Elephant (Elephas maximus)</h3>
            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">High Caution</span>
          </div>
          <ul className="space-y-1.5 text-slate-600">
            <li>• Maintain at least 100 meters distance at all times.</li>
            <li>• Never block an elephant's traditional corridor, path or stream access.</li>
            <li>• Do not honk, yell, or shine headlights/torches directly into their eyes.</li>
            <li>• Be extra cautious during harvest season and around herds with young calves.</li>
          </ul>
        </div>

        {/* Leopard */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">🐆 Indian Leopard (Panthera pardus)</h3>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Nocturnal Vigil</span>
          </div>
          <ul className="space-y-1.5 text-slate-600">
            <li>• Secure domestic cattle, goats and dogs in closed sheds before dusk.</li>
            <li>• Keep residential premises clear of dense bush, tall weeds and garbage.</li>
            <li>• Never crouch or bend down in tall grass; maintain upright posture.</li>
            <li>• If confronted, do not run. Back away slowly while facing the animal.</li>
          </ul>
        </div>

        {/* Wild Boar */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">🐗 Wild Boar (Sus scrofa)</h3>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Agro Conflict</span>
          </div>
          <ul className="space-y-1.5 text-slate-600">
            <li>• Use solar-powered flashing LED lights along farm boundaries.</li>
            <li>• Never use live wire fences or explosive bait balls (illegal & lethal).</li>
            <li>• Sound bio-acoustic buzzers upon receiving WILDLINK app detection alert.</li>
          </ul>
        </div>

        {/* Venomous Snakes */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">🐍 Big Four Venomous Snakes</h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Rescue First</span>
          </div>
          <ul className="space-y-1.5 text-slate-600">
            <li>• Wear gumboots and use a torch when walking outside at night.</li>
            <li>• Keep firewood stacks and construction debris away from house walls.</li>
            <li>• Call WILDLINK rescue helpline for certified snake rescuer dispatch.</li>
            <li>• In case of snakebite, immobilize limb and proceed immediately to hospital.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
