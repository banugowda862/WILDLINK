import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Send,
  Navigation
} from 'lucide-react';
import type { RiskLevel, RoleEnum } from '../types';

export const ReportSubmissionPage: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState('animal_crossing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(11.6664);
  const [longitude, setLongitude] = useState(76.6291);
  const [species, setSpecies] = useState('Asian Elephant');
  const [severity, setSeverity] = useState<RiskLevel>('medium');
  const [reporterName, setReporterName] = useState(user?.displayName || 'Citizen Reporter');
  const [reporterContact, setReporterContact] = useState('+91 ');
  const [isPublic, setIsPublic] = useState(true);
  const [privacyConsent, setPrivacyConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setLocationName(`Current GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        (err) => alert('Geolocation error: ' + err.message)
      );
    } else {
      alert('Geolocation not supported by browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locationName) {
      alert('Please fill all mandatory fields');
      return;
    }
    if (!privacyConsent) {
      alert('Please agree to the wildlife privacy consent terms.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitReport({
        category,
        title,
        description,
        location_name: locationName,
        latitude,
        longitude,
        species: species || 'Unknown Wildlife',
        severity,
        reporter_name: reporterName,
        reporter_contact: reporterContact,
        reporter_role: role,
        is_public: isPublic,
        privacy_consent: privacyConsent
      });

      setSubmittedReportId(res.report.report_id);
    } catch (err: any) {
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedReportId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Report Successfully Submitted!</h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
          Your report has been logged with ID{' '}
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
            {submittedReportId}
          </span>
          . Forest Range Officers have been notified for priority verification.
        </p>
        <div className="pt-4 flex justify-center space-x-3">
          <button
            onClick={() => {
              setSubmittedReportId(null);
              setTitle('');
              setDescription('');
            }}
            className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
          >
            Submit Another Report
          </button>
          <button
            onClick={() => navigate('/map')}
            className="px-5 py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-600"
          >
            View on Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Citizen Coexistence Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Report a Wildlife Incident or Threat</h1>
        <p className="text-sm text-slate-600">
          Your report alerts local forest personnel and nearby communities to prevent human–animal conflict.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        {/* Category Picker */}
        <div className="space-y-2">
          <label className="block text-slate-800 font-bold text-sm">Incident Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <optgroup label="Wildlife Sightings & Movements">
              <option value="animal_sighting">Animal Sighting (General)</option>
              <option value="residential_sighting">Animal Entering Residential / Village Area</option>
              <option value="wildlife_road_crossing">Wildlife Road / Railway Crossing</option>
              <option value="crop_damage">Crop Damage / Agricultural Conflict</option>
              <option value="roadkill">Wildlife Roadkill / Vehicle Hit</option>
            </optgroup>
            <optgroup label="Rescue & Distress">
              <option value="injured_animal">Injured / Sick Wild Animal</option>
              <option value="trapped_animal">Trapped Animal / Caught in Wire or Well</option>
              <option value="animal_requiring_rescue">Orphaned Juvenile / Avian Rescue</option>
            </optgroup>
            <optgroup label="Wildlife Crime & Environmental Threats">
              <option value="poaching_threat">Suspected Poaching / Hunting / Snares</option>
              <option value="forest_fire">Forest Fire / Active Smoke</option>
              <option value="habitat_destruction">Illegal Tree Felling / Encroachment</option>
              <option value="water_scarcity">Water Scarcity / Dried Natural Waterhole</option>
              <option value="pollution">Plastic or Toxic Waste Dumping in Forest</option>
              <option value="other">Other Wildlife Hazard</option>
            </optgroup>
          </select>
        </div>

        {/* Title & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="block text-slate-800 font-bold">Report Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 3 Elephants grazing along Bandipur Highway edge Km 24"
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block text-slate-800 font-bold">Detailed Observations *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe animal count, direction of movement, nearby humans, vehicle behavior, any signs of aggression or distress..."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        {/* Species & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-slate-800 font-bold">Species (if known or unknown)</label>
            <input
              type="text"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="e.g. Asian Elephant, Wild Boar, Leopard, or 'Unknown'"
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-slate-800 font-bold">Severity / Risk Level</label>
            <select
              value={severity}
              onChange={(e: any) => setSeverity(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs"
            >
              <option value="low">Low (Passive sighting, no immediate risk)</option>
              <option value="medium">Medium (Close to road or crops)</option>
              <option value="high">High (Entering residential area / active hazard)</option>
              <option value="critical">Critical (Injured predator / immediate human emergency)</option>
            </select>
          </div>
        </div>

        {/* Location & GPS */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="block text-slate-800 font-bold">Incident Location / Landmark *</label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1 text-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Use Current GPS</span>
            </button>
          </div>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Bandipur Highway Km 24 near Moolehole checkpost"
            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
            required
          />
          <div className="grid grid-cols-2 gap-3 text-slate-500 text-[11px]">
            <div>Lat: {latitude.toFixed(4)}</div>
            <div>Lng: {longitude.toFixed(4)}</div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-slate-800 font-bold">Your Name / Alias</label>
            <input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-slate-800 font-bold">Contact Phone (Optional for officer follow-up)</label>
            <input
              type="text"
              value={reporterContact}
              onChange={(e) => setReporterContact(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2 text-xs"
            />
          </div>
        </div>

        {/* Privacy & Anti-Poaching Consent */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-[11px] text-slate-600 leading-normal">
              <strong>Wildlife Privacy & Ethical Verification Consent:</strong> I confirm this is a genuine observation.
              I understand that exact coordinates will not be made publicly accessible to protect animals from poaching,
              and that verified reports are dispatched directly to Forest Range Offices.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-sm"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting to Forest Department...' : 'Transmit Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
