'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, StaffUser } from '../types/clinical';
import { INITIAL_STAFF_USERS } from '../mockData/clinicalModulesData';

interface AuthContextType {
  currentUser: AuthUser | null;
  staffList: StaffUser[];
  login: (user: AuthUser) => void;
  logout: () => void;
  addStaffUser: (user: StaffUser) => void;
  toggleStaffStatus: (id: string) => void;
  updateStaffPermissions: (id: string, modulePermissions: any) => void;
  updateStaffPasscode: (id: string, newPasscode: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [staffList, setStaffList] = useState<StaffUser[]>(INITIAL_STAFF_USERS);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arpan_auth_user');
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved auth user', e);
        }
      } else {
        // Default Doctor account on initial launch
        setCurrentUser({
          id: 'ST-103',
          name: 'Dr. Yashwant Dubey',
          staffId: 'DOC-8849',
          role: 'Doctor',
          modulePermissions: 'Full Access',
          department: 'Chief Cardiology & Internal Medicine'
        });
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      if (currentUser) {
        localStorage.setItem('arpan_auth_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('arpan_auth_user');
      }
    }
  }, [currentUser, isInitialized]);

  const login = (user: AuthUser) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arpan_auth_user', JSON.stringify(user));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('arpan_auth_user');
    }
  };

  const addStaffUser = (user: StaffUser) => {
    setStaffList((prev) => [user, ...prev]);
  };

  const toggleStaffStatus = (id: string) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id || s.staffId === id ? { ...s, active: !s.active } : s))
    );
  };

  const updateStaffPermissions = (id: string, modulePermissions: any) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id || s.staffId === id ? { ...s, modulePermissions } : s))
    );
  };

  const updateStaffPasscode = (id: string, newPasscode: string) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id || s.staffId === id ? { ...s, passcode: newPasscode } : s))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        staffList,
        login,
        logout,
        addStaffUser,
        toggleStaffStatus,
        updateStaffPermissions,
        updateStaffPasscode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
