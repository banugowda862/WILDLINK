import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Alert, Detection } from '../types';
import { api } from '../services/api';

interface AlertContextType {
  activeAlerts: Alert[];
  latestDetection: Detection | null;
  refreshAlerts: () => Promise<void>;
  triggerDemo: (scenario: 'elephant_highway' | 'wild_boar_farm' | 'predator_perimeter') => Promise<void>;
  notificationToast: string | null;
  dismissToast: () => void;
}

const AlertContext = createContext<AlertContextType>({
  activeAlerts: [],
  latestDetection: null,
  refreshAlerts: async () => {},
  triggerDemo: async () => {},
  notificationToast: null,
  dismissToast: () => {}
});

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [latestDetection, setLatestDetection] = useState<Detection | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext might be blocked until user interacts
    }
  };

  const refreshAlerts = async () => {
    try {
      const alerts = await api.getAlerts(true, true);
      setActiveAlerts(alerts);
    } catch (e) {
      console.warn('Alert refresh error:', e);
    }
  };

  useEffect(() => {
    refreshAlerts();
    const interval = setInterval(refreshAlerts, 20000);
    return () => clearInterval(interval);
  }, []);

  const triggerDemo = async (scenario: 'elephant_highway' | 'wild_boar_farm' | 'predator_perimeter') => {
    try {
      const res = await api.triggerDemoScenario(scenario);
      setLatestDetection(res.detection);
      setNotificationToast(`[DEMO EVENT] New detection triggered: ${res.detection.possible_species} on device ${res.detection.device_id}`);
      playBeep();
      await refreshAlerts();
    } catch (err: any) {
      setNotificationToast(`Trigger failed: ${err.message}`);
    }
  };

  const dismissToast = () => setNotificationToast(null);

  return (
    <AlertContext.Provider
      value={{
        activeAlerts,
        latestDetection,
        refreshAlerts,
        triggerDemo,
        notificationToast,
        dismissToast
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext);
