import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-xs leading-relaxed text-slate-700">
      <div>
        <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Legal Compliance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Terms of Use & Statutory Guidelines
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Statutory obligations under the Wild Life (Protection) Act, 1972 and humane coexistence covenants.
        </p>
      </div>

      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 text-rose-700">
            1. Prohibition of Cruelty & Harmful Deterrents
          </h2>
          <p>
            Users of WILDLINK explicitly agree to abide by statutory wildlife protection laws:
          </p>
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-950 space-y-1.5 font-medium">
            <div>• Electrocution using live mains or uncertified electric fencing is strictly banned (cognizable offense).</div>
            <div>• Chemical poisoning of water sources, carcasses, or crop bait is punishable with up to 7 years imprisonment.</div>
            <div>• Jaw traps, wire snares and explosive pellets are strictly prohibited under Section 9.</div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Emergency Guidance & Factual Reporting</h2>
          <p>
            Users must submit truthful observations. Submitting knowingly false reports to induce public panic or distract
            forest patrols is subject to administrative penalties. In life-threatening emergencies, citizens must call
            1800-945-3546 rather than rely solely on digital reports.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Demonstration Environment</h2>
          <p>
            While running in Demo Mode, simulated incidents and thermal detections represent fictional scenarios
            specifically formulated for platform testing. No real emergency dispatches are generated from simulated events.
          </p>
        </section>
      </div>
    </div>
  );
};
