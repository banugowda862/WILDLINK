import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Shield, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setSelectedRole] = useState<UserRole>('resident');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Create WILDLINK Account</h1>
        <p className="text-xs text-slate-500">
          Join your local coexistence community for farm protection, highway safety alerts and wildlife aid.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ramesh@example.com"
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
          <label className="block text-slate-700 font-semibold mb-1">Your Primary Role</label>
          <select
            value={role}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white font-medium"
          >
            <option value="farmer">Farmer / Planter (Crop Defense & Alerts)</option>
            <option value="resident">Resident (Village / Urban Buffer Settlement)</option>
            <option value="driver">Driver / Motorist (Forest Highway Alerts)</option>
            <option value="volunteer">Volunteer (Community Coexistence)</option>
            <option value="ngo">NGO / Wildlife Researcher</option>
          </select>
          <p className="text-[10px] text-slate-400 mt-1">
            Note: Forest Officer and Administrator roles require official credential verification.
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl shadow transition text-xs flex items-center justify-center space-x-2"
        >
          <span>Create Account</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-2 text-center text-slate-500 text-[11px]">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-700 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </form>
    </div>
  );
};
