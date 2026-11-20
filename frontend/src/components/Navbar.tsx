import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  MapPin,
  AlertOctagon,
  FileText,
  Activity,
  PhoneCall,
  Menu,
  X,
  Compass,
  Tractor,
  HeartHandshake,
  Layers,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout, isOfficer, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-emerald-950 text-white border-b border-emerald-900 sticky top-7 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-emerald-700 group-hover:bg-emerald-600 p-2 rounded-xl text-white shadow-inner transition">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">WILDLINK</span>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 uppercase font-semibold px-1.5 py-0.5 rounded tracking-wider">
                  Coexistence
                </span>
              </div>
              <p className="text-[10px] text-emerald-300 tracking-wide hidden sm:block">
                Protect Wildlife. Protect People. Preserve Nature.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 text-sm font-medium">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition ${
                isActive('/') ? 'bg-emerald-900 text-emerald-300' : 'text-slate-200 hover:text-white hover:bg-emerald-900/50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/map"
              className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition ${
                isActive('/map') ? 'bg-emerald-900 text-emerald-300' : 'text-slate-200 hover:text-white hover:bg-emerald-900/50'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Safety Map</span>
            </Link>

            {/* Modules Dropdown */}
            <div className="relative">
              <button
                onClick={() => setModulesDropdownOpen(!modulesDropdownOpen)}
                onBlur={() => setTimeout(() => setModulesDropdownOpen(false), 200)}
                className="px-3 py-2 rounded-lg flex items-center space-x-1 text-slate-200 hover:text-white hover:bg-emerald-900/50 transition"
              >
                <span>Modules</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {modulesDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <Link
                    to="/crop-protection"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-emerald-950 text-slate-200 hover:text-emerald-300"
                  >
                    <Tractor className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-semibold">Crop Protection</div>
                      <div className="text-[10px] text-slate-400">Farmer safety & deterrent guidance</div>
                    </div>
                  </Link>

                  <Link
                    to="/road-alerts"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-emerald-950 text-slate-200 hover:text-emerald-300"
                  >
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    <div>
                      <div className="font-semibold">Road & Railway Alerts</div>
                      <div className="text-[10px] text-slate-400">Driver crossing cautions</div>
                    </div>
                  </Link>

                  <Link
                    to="/rescue"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-emerald-950 text-slate-200 hover:text-emerald-300"
                  >
                    <HeartHandshake className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold">Wildlife Rescue</div>
                      <div className="text-[10px] text-slate-400">Injured & distressed animal aid</div>
                    </div>
                  </Link>

                  <Link
                    to="/sightings"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-emerald-950 text-slate-200 hover:text-emerald-300"
                  >
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-semibold">City & Village Sightings</div>
                      <div className="text-[10px] text-slate-400">Residential area advisories</div>
                    </div>
                  </Link>

                  <Link
                    to="/environmental-threats"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-emerald-950 text-slate-200 hover:text-emerald-300"
                  >
                    <Layers className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="font-semibold">Environmental Threats</div>
                      <div className="text-[10px] text-slate-400">Forest fires, poaching, snares</div>
                    </div>
                  </Link>

                  <div className="border-t border-slate-800 my-1"></div>

                  <Link
                    to="/how-it-works"
                    className="block px-4 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    How WILDLINK Works
                  </Link>
                  <Link
                    to="/about"
                    className="block px-4 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    About WILDLINK Mission
                  </Link>
                  <Link
                    to="/awareness"
                    className="block px-4 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Awareness & Safety Guidelines
                  </Link>
                  <Link
                    to="/volunteer"
                    className="block px-4 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Volunteer & Community
                  </Link>
                </div>
              )}
            </div>

            {/* Officer Links */}
            {isOfficer && (
              <div className="flex items-center space-x-1 border-l border-emerald-800/80 pl-2 ml-1">
                <Link
                  to="/officer"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-1 transition ${
                    location.pathname.startsWith('/officer')
                      ? 'bg-emerald-800 text-emerald-200'
                      : 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Officer Hub</span>
                </Link>

                <Link
                  to="/officer/monitoring"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive('/officer/monitoring')
                      ? 'bg-emerald-800 text-emerald-200'
                      : 'text-emerald-300 hover:bg-emerald-900/50'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 inline mr-1" />
                  Thermal Grid
                </Link>
              </div>
            )}

            {/* Admin Links */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-purple-900 text-purple-200'
                    : 'bg-purple-950/70 text-purple-300 hover:bg-purple-900'
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              to="/report"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow flex items-center space-x-1.5 transition transform active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Report Threat</span>
            </Link>

            <Link
              to="/contact"
              className="bg-rose-950/80 border border-rose-800 text-rose-200 hover:bg-rose-900 font-medium text-xs px-3 py-2 rounded-lg flex items-center space-x-1 transition"
              title="Forest Department 24/7 Wildlife Emergency Line"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden xl:inline">Emergency: 1800-945-3546</span>
              <span className="xl:hidden">Emergency</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-emerald-800">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1.5 text-xs text-slate-200 hover:text-white"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-emerald-200">
                    {user.displayName.charAt(0)}
                  </div>
                  <span className="font-medium hidden xl:inline">{user.displayName.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-slate-200 p-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs text-slate-300 hover:text-white font-medium px-3 py-2"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <Link
              to="/report"
              className="bg-emerald-600 text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold"
            >
              Report
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 pt-3 pb-6 space-y-3 text-sm">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-emerald-300 font-medium"
          >
            Home
          </Link>
          <Link
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-emerald-300 font-medium"
          >
            Wildlife Safety Map
          </Link>
          <Link
            to="/crop-protection"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-emerald-300 font-medium"
          >
            Crop Protection
          </Link>
          <Link
            to="/road-alerts"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-emerald-300 font-medium"
          >
            Road & Railway Alerts
          </Link>
          <Link
            to="/rescue"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-emerald-300 font-medium"
          >
            Wildlife Rescue
          </Link>
          <Link
            to="/sightings"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-emerald-300 font-medium"
          >
            City & Village Sightings
          </Link>
          <Link
            to="/environmental-threats"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-emerald-300 font-medium"
          >
            Environmental Threats
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            How It Works
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            About WILDLINK
          </Link>

          {isOfficer && (
            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs uppercase text-emerald-400 font-semibold mb-1">Authorised Officer</div>
              <Link
                to="/officer"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-emerald-300 font-medium"
              >
                Officer Hub Dashboard
              </Link>
              <Link
                to="/officer/monitoring"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-emerald-300 font-medium"
              >
                Thermal Camera Monitoring
              </Link>
            </div>
          )}

          {isAdmin && (
            <div className="pt-2 border-t border-slate-800">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-purple-300 font-medium"
              >
                Admin Dashboard & Logs
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-rose-300 font-semibold"
            >
              Emergency Hotline: 1800-945-3546
            </Link>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-emerald-400 font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
