import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-12 pb-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Vision */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <div className="bg-emerald-700 p-1.5 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">WILDLINK</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Protect Wildlife. Protect People. Preserve Nature. An integrated platform connecting communities,
              thermal sensors, AI detection and conservation response teams.
            </p>
            <div className="pt-2 text-[11px] text-emerald-400 flex items-center space-x-1.5">
              <span>🌱 Humane Coexistence Initiative</span>
            </div>
          </div>

          {/* Col 2: Navigation Modules */}
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">
              Coexistence Modules
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/map" className="hover:text-emerald-400 transition">
                  Wildlife Safety Map
                </Link>
              </li>
              <li>
                <Link to="/crop-protection" className="hover:text-emerald-400 transition">
                  Crop Protection (Farmer Desk)
                </Link>
              </li>
              <li>
                <Link to="/road-alerts" className="hover:text-emerald-400 transition">
                  Road & Highway Wildlife Warnings
                </Link>
              </li>
              <li>
                <Link to="/rescue" className="hover:text-emerald-400 transition">
                  Animal Rescue & Veterinary Dispatch
                </Link>
              </li>
              <li>
                <Link to="/sightings" className="hover:text-emerald-400 transition">
                  City & Village Wildlife Sightings
                </Link>
              </li>
              <li>
                <Link to="/environmental-threats" className="hover:text-emerald-400 transition">
                  Forest Fires & Environmental Threats
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Awareness & Legal */}
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">
              Community & Safety
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/how-it-works" className="hover:text-emerald-400 transition">
                  How WILDLINK Works
                </Link>
              </li>
              <li>
                <Link to="/awareness" className="hover:text-emerald-400 transition">
                  Species Safety & Dos and Don'ts
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="hover:text-emerald-400 transition">
                  Community Volunteer Network
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-emerald-400 transition">
                  Privacy Policy & Coordinate Masking
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-emerald-400 transition">
                  Terms of Use & Ethical Wildlife Law
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition">
                  About the Conservation Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Emergency Contacts & Ethical Warning */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Wildlife Emergency Response
            </h4>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs">
                <Phone className="w-4 h-4" />
                <span>24/7 Helpline: 1800-945-3546</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300 text-[11px]">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>emergency@wildlink.org</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-400 text-[10px]">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>Southern Forest Buffer Command & Wildlife Rapid Response Desk</span>
              </div>
            </div>

            <div className="bg-amber-950/40 border border-amber-900/60 p-2.5 rounded-lg text-[10px] text-amber-200/90 leading-tight">
              <strong className="block text-amber-300 font-semibold mb-1">
                ⚠️ Legal & Ethical Notice:
              </strong>
              Never approach, corner or provoke wild animals. Use of poison, live wire fences or illegal snares
              is strictly punishable under the Wild Life (Protection) Act, 1972.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© 2026 WILDLINK Conservation Technology Platform. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-400/80">Karnataka • Western Ghats Pilot Corridors</span>
            <span>•</span>
            <span className="text-amber-400/80">Demo & Evaluation Mode Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
