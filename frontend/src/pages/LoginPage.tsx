import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Shield, KeyRound, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, setRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('officer.deshmukh@forest.gov.in');
  const [password, setPassword] = useState('password123');
  const [role, setSelectedRole] = useState<UserRole>('forest_officer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    navigate(role === 'forest_officer' ? '/officer' : role === 'admin' ? '/admin' : '/dashboard');
  };

  const handleQuickDemo = (demoRole: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setSelectedRole(demoRole);
    login(demoEmail, demoRole);
    navigate(demoRole === 'forest_officer' ? '/officer' : demoRole === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Sign in to WILDLINK</h1>
        <p className="text-xs text-slate-500">
          Access your role-based dashboard, farm registrations or officer verification console.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">Select Persona / Role</label>
          <select
            value={role}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white font-medium"
          >
            <option value="forest_officer">Forest Range Officer (Authorized Verification)</option>
            <option value="admin">Platform Administrator (Full Access)</option>
            <option value="farmer">Farmer (Crop & Bio-Acoustic Protection)</option>
            <option value="resident">Resident (Village / Urban Fringe Sightings)</option>
            <option value="driver">Driver (Highway Speed Advisories)</option>
            <option value="volunteer">Volunteer (Community Coexistence)</option>
            <option value="public">Public Visitor</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl shadow transition text-xs flex items-center justify-center space-x-2"
        >
          <span>Sign In to Platform</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-2 text-center text-slate-500 text-[11px]">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-700 font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </form>

      {/* Quick Demo Evaluation Logins */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
        <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Quick 1-Click Persona Evaluator:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <button
            onClick={() => handleQuickDemo('forest_officer', 'officer.deshmukh@forest.gov.in')}
            className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-bold text-left"
          >
            👮 Forest Officer Hub
          </button>
          <button
            onClick={() => handleQuickDemo('farmer', 'somanna.farmer@kutta.in')}
            className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-left"
          >
            🌾 Farmer Portal
          </button>
          <button
            onClick={() => handleQuickDemo('admin', 'admin@wildlink.org')}
            className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg font-bold text-left"
          >
            ⚙️ Platform Admin
          </button>
          <button
            onClick={() => handleQuickDemo('resident', 'resident.kavitha@nagarhole.in')}
            className="p-2 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-lg font-bold text-left"
          >
            🏡 Resident Sighting
          </button>
        </div>
      </div>
    </div>
  );
};
