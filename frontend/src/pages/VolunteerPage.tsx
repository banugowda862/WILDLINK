import React, { useState } from 'react';
import { Users, Heart, CheckCircle2 } from 'lucide-react';

export const VolunteerPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [village, setVillage] = useState('');
  const [skills, setSkills] = useState('');
  const [signedUp, setSignedUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignedUp(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full text-xs">
          <Users className="w-4 h-4" />
          <span>Community Engagement</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Join the WILDLINK Volunteer Network
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Connect with local village coexistence committees, anti-snare monitoring teams and certified rescue responders.
        </p>
      </div>

      {signedUp ? (
        <div className="bg-emerald-50 border border-emerald-300 p-8 rounded-2xl text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-lg">Thank You for Volunteering!</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Your registration has been logged. The local Range Coexistence Officer will reach out for the next community training session.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Village / Taluk / Location</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Gundlupet / Kutta"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Area of Contribution</label>
              <select
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs"
              >
                <option value="crop_guarding">Bio-Acoustic Farmer Guarding</option>
                <option value="rescue_assistant">Certified Animal Rescue Assistant</option>
                <option value="school_education">School Wildlife Awareness Educator</option>
                <option value="anti_snare">Anti-Snare Perimeter Patrol</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-900 hover:bg-purple-800 text-white font-bold rounded-xl shadow transition"
          >
            Submit Volunteer Registration
          </button>
        </form>
      )}
    </div>
  );
};
