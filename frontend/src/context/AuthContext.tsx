import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  isOfficer: boolean;
  isAdmin: boolean;
}

const defaultUser: User = {
  uid: 'USR-DEV-001',
  email: 'officer.deshmukh@forest.gov.in',
  displayName: 'M. Deshmukh (Range Officer)',
  role: 'forest_officer',
  organization: 'Karnataka Forest Dept (Bandipur Core)'
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  role: 'forest_officer',
  setRole: () => {},
  login: () => {},
  logout: () => {},
  isOfficer: true,
  isAdmin: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wildlink_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultUser;
      }
    }
    return defaultUser;
  });

  const role: UserRole = user?.role || 'public';

  const setRole = (newRole: UserRole) => {
    if (!user) {
      const newUser: User = {
        uid: `USR-${Date.now()}`,
        email: `${newRole}@wildlink.org`,
        displayName: `${newRole.replace('_', ' ').toUpperCase()} User`,
        role: newRole
      };
      setUser(newUser);
      localStorage.setItem('wildlink_user', JSON.stringify(newUser));
      return;
    }
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('wildlink_user', JSON.stringify(updated));
  };

  const login = (email: string, selectedRole: UserRole = 'resident') => {
    const loggedUser: User = {
      uid: `USR-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      role: selectedRole
    };
    setUser(loggedUser);
    localStorage.setItem('wildlink_user', JSON.stringify(loggedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wildlink_user');
  };

  const isOfficer = role === 'forest_officer' || role === 'admin';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider value={{ user, role, setRole, login, logout, isOfficer, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
