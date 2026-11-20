import React from 'react';
import { Shield, Lock, EyeOff, MapPin } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-xs leading-relaxed text-slate-700">
      <div>
        <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
          <Shield className="w-4 h-4" />
          <span>Ethics & Data Governance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Wildlife & User Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          How WILDLINK protects both citizen identity and endangered wildlife species locations.
        </p>
      </div>

      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-emerald-600" />
            <span>1. Anti-Poaching Coordinate Jittering & Masking</span>
          </h2>
          <p>
            Under the Wildlife Protection Act, publishing precise GPS coordinates of Schedule I endangered species
            (e.g., Asian Elephant, Bengal Tiger, Indian Leopard, Pangolin) facilitates illegal poaching, wildlife harassment,
            and disruptive safari tourism.
          </p>
          <p className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-950 font-medium">
            WILDLINK strictly generalises all public-facing map markers by applying an artificial ~800m privacy jitter.
            Exact GPS coordinates and raw thermal sensor telemetry are accessible solely to authorized Forest Officers
            with verified departmental credentials.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>2. Citizen Reporter Anonymity & PII Protection</span>
          </h2>
          <p>
            When submitting incident reports, citizen names and phone numbers are never broadcast on public map feeds.
            Contact information is stored in encrypted database fields accessible only to Range Officers for follow-up
            investigations and crop relief disbursements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Non-Lethal & Ethical AI Standards</h2>
          <p>
            Thermal detections from MLX90640 sensors are designated as candidate heat signatures, not definitive species identifications.
            Automated algorithms never autonomously initiate wildlife capture, driving, relocation, or physical intervention without
            certified wildlife biologists and forest range officers.
          </p>
        </section>
      </div>
    </div>
  );
};
