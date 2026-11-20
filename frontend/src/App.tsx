import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { DemoControlBar } from './components/DemoControlBar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { SafetyMapPage } from './pages/SafetyMapPage';
import { CropProtectionPage } from './pages/CropProtectionPage';
import { RoadAlertsPage } from './pages/RoadAlertsPage';
import { RescuePage } from './pages/RescuePage';
import { SightingsPage } from './pages/SightingsPage';
import { EnvironmentalThreatsPage } from './pages/EnvironmentalThreatsPage';
import { ReportSubmissionPage } from './pages/ReportSubmissionPage';
import { OfficerDashboardPage } from './pages/OfficerDashboardPage';
import { OfficerMonitoringPage } from './pages/OfficerMonitoringPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { About } from './pages/About';
import { HowItWorks } from './pages/HowItWorks';
import { AwarenessPage } from './pages/AwarenessPage';
import { VolunteerPage } from './pages/VolunteerPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { UserDashboardPage } from './pages/UserDashboardPage';

export function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            <DemoControlBar />
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/map" element={<SafetyMapPage />} />
                <Route path="/crop-protection" element={<CropProtectionPage />} />
                <Route path="/road-alerts" element={<RoadAlertsPage />} />
                <Route path="/rescue" element={<RescuePage />} />
                <Route path="/sightings" element={<SightingsPage />} />
                <Route path="/environmental-threats" element={<EnvironmentalThreatsPage />} />
                <Route path="/threats" element={<Navigate to="/environmental-threats" replace />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/about" element={<About />} />
                <Route path="/awareness" element={<AwarenessPage />} />
                <Route path="/volunteer" element={<VolunteerPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />

                {/* Reporting & User Dashboards */}
                <Route path="/report" element={<ReportSubmissionPage />} />
                <Route path="/dashboard" element={<UserDashboardPage />} />
                <Route path="/my-reports" element={<UserDashboardPage />} />
                <Route path="/my-farm" element={<CropProtectionPage />} />

                {/* Authorised Officer Routes */}
                <Route path="/officer" element={<OfficerDashboardPage />} />
                <Route path="/officer/verify" element={<OfficerDashboardPage />} />
                <Route path="/officer/monitoring" element={<OfficerMonitoringPage />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/devices" element={<OfficerMonitoringPage />} />
                <Route path="/admin/audit-logs" element={<AdminDashboardPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
