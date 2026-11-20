import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { IncidentReport, Detection, Alert } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  Send,
  Eye,
  Activity,
  FileCheck,
  Clock,
  Radio
} from 'lucide-react';

export const OfficerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [officerNotes, setOfficerNotes] = useState('');
  const [assignedTeam, setAssignedTeam] = useState('Rapid Response Squad #1');
  const [escalateToAlert, setEscalateToAlert] = useState(true);
  const [alertSeverity, setAlertSeverity] = useState('warning');
  const [alertMessage, setAlertMessage] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadData = async () => {
    try {
      const [rData, dData] = await Promise.all([
        api.getReports(),
        api.getDetections(true)
      ]);
      setReports(rData);
      setDetections(dData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (incidentId: string, verified: boolean) => {
    try {
      await api.verifyIncident(
        incidentId,
        verified,
        user?.displayName || 'Officer M. Deshmukh',
        officerNotes,
        verified && escalateToAlert,
        alertSeverity,
        alertMessage
      );

      setActionSuccess(`Incident ${incidentId} marked as ${verified ? 'VERIFIED' : 'REJECTED'}`);
      setSelectedIncident(null);
      setOfficerNotes('');
      loadData();
    } catch (err: any) {
      alert('Verification failed: ' + err.message);
    }
  };

  const pendingReports = reports.filter((r) => r.status === 'pending_verification' || r.status === 'submitted');
  const verifiedReports = reports.filter((r) => r.status === 'verified' || r.status === 'assigned');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Authorized Forest Range Office</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forest Officer Command Hub</h1>
          <p className="text-sm text-slate-600">
            Field incident verification, emergency squad dispatch, and authorized public warning dissemination.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-900 text-emerald-100 px-4 py-2 rounded-xl text-xs font-semibold">
          <UserCheck className="w-4 h-4 text-emerald-300" />
          <span>Active Officer: {user?.displayName || 'M. Deshmukh'}</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3 rounded-xl flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs text-amber-700 font-bold uppercase tracking-wider">Pending Verification</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{pendingReports.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Citizen & Sensor inputs</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Verified & Active</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{verifiedReports.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Dispatched to field teams</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs text-sky-700 font-bold uppercase tracking-wider">Thermal Detections</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{detections.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Logged from MLX90640 nodes</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs text-purple-700 font-bold uppercase tracking-wider">Avg Response Time</div>
          <div className="text-3xl font-black text-slate-900 mt-1">24 min</div>
          <div className="text-[11px] text-slate-400 mt-1">Within target corridor KPI</div>
        </div>
      </div>

      {/* Verification Queue Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-amber-600" />
              <span>Priority Incident Verification Queue</span>
            </h2>
            <p className="text-xs text-slate-500">
              Evaluate citizen submissions and automated candidate heat signatures before escalation.
            </p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full">
            {pendingReports.length} Awaiting Review
          </span>
        </div>

        {pendingReports.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No pending reports. All incident reports have been verified.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReports.map((report) => (
              <div
                key={report.report_id}
                className="p-5 border border-slate-200 rounded-xl hover:border-emerald-500 transition space-y-3 text-xs bg-slate-50/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{report.title}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                      {report.report_id}
                    </span>
                    {report.simulated && (
                      <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1 rounded">
                        DEMO
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    Severity: {report.severity}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed">{report.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500 bg-white p-3 rounded-lg border border-slate-200">
                  <div>Species: <strong className="text-slate-800">{report.species}</strong></div>
                  <div>Area: <strong className="text-slate-800">{report.location_name}</strong></div>
                  <div>Reporter: <strong className="text-slate-800">{report.reporter_name} ({report.reporter_role})</strong></div>
                  <div>Contact: <strong className="text-slate-800">{report.reporter_contact || 'None'}</strong></div>
                </div>

                {/* Verification Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-slate-400 text-[10px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Reported: {new Date(report.date_time).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedIncident(report)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold flex items-center space-x-1"
                    >
                      <span>Review & Dispatch</span>
                    </button>
                    <button
                      onClick={() => handleVerify(report.report_id, false)}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg font-semibold flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                {/* Review Sub-Form Modal / Drawer */}
                {selectedIncident?.report_id === report.report_id && (
                  <div className="mt-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                    <h4 className="font-bold text-emerald-950 text-xs">Officer Verification & Alert Escalation</h4>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Field Assessment Notes</label>
                      <input
                        type="text"
                        value={officerNotes}
                        onChange={(e) => setOfficerNotes(e.target.value)}
                        placeholder="e.g. Confirmed with Moolehole anti-poaching watcher. 3 elephants crossed road."
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Assign Response Unit</label>
                        <select
                          value={assignedTeam}
                          onChange={(e) => setAssignedTeam(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                        >
                          <option value="Rapid Response Squad #1">Rapid Response Squad #1 (Highway)</option>
                          <option value="Bandipur Elephant Task Force (ETF)">Bandipur Elephant Task Force (ETF)</option>
                          <option value="Hunsur Agro-Conflict Unit">Hunsur Agro-Conflict Unit</option>
                          <option value="Wildlife Rescue Ambulance Unit #2">Wildlife Rescue Ambulance Unit #2</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Public Broadcast Warning</label>
                        <label className="flex items-center space-x-2 mt-2">
                          <input
                            type="checkbox"
                            checked={escalateToAlert}
                            onChange={(e) => setEscalateToAlert(e.target.checked)}
                            className="rounded text-emerald-600"
                          />
                          <span className="font-medium text-slate-800">Publish Active Warning to Public Map</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() => setSelectedIncident(null)}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleVerify(report.report_id, true)}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg shadow flex items-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Confirm & Dispatch</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
