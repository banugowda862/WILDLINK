import React from 'react';
import { Phone, Mail, MapPin, AlertTriangle, Shield } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-xs">
      <div>
        <div className="inline-flex items-center space-x-2 bg-rose-100 text-rose-800 font-bold px-3 py-1 rounded-full text-xs">
          <Phone className="w-4 h-4" />
          <span>Emergency Coordination</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Emergency Contacts & Range Offices
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Direct telephone directory for rapid forest department interventions, rescue squads and human safety advisories.
        </p>
      </div>

      <div className="bg-rose-950 text-white p-6 rounded-2xl border border-rose-900 shadow-lg space-y-3">
        <h3 className="font-extrabold text-lg text-rose-300">24/7 Wildlife Conflict Rapid Response Desk</h3>
        <p className="text-rose-100 leading-relaxed text-xs">
          For acute emergencies (elephants in village streets, leopard trapped in cattle shed, snakebite assistance, or active forest fire):
        </p>
        <div className="text-2xl font-black text-white font-mono tracking-wider">
          Toll-Free: 1800-945-3546 (1800-WILD-LINK)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Bandipur Forest Range Office</h3>
          <p className="text-slate-600">Bandipur Tiger Reserve Headquarters, Gundlupet, Karnataka - 571126</p>
          <div className="space-y-1 text-slate-700">
            <div>Control Room: +91 8229 236043</div>
            <div>Range Forest Officer: +91 94808 12345</div>
            <div>Email: rfo.bandipur@forest.gov.in</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Nagarhole Wildlife Division</h3>
          <p className="text-slate-600">Hunsur Wildlife Division, Mysore District, Karnataka - 571105</p>
          <div className="space-y-1 text-slate-700">
            <div>Control Room: +91 8222 252041</div>
            <div>Elephant Task Force: +91 94808 67890</div>
            <div>Email: dcf.nagarhole@forest.gov.in</div>
          </div>
        </div>
      </div>
    </div>
  );
};
