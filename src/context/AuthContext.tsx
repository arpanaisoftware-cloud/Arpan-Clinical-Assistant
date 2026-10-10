'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { AuthUser, StaffUser, ModulePermission } from '../types/clinical';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setCurrentUser, logoutUser, verifySession } from '../redux/slices/authSlice';
import {
  fetchStaffList,
  addStaffMember,
  updateStaffMember,
  toggleStaffMemberStatus,
  deleteStaffMember,
  localAddStaff,
  localToggleStatus,
  localUpdateStaff,
  localDeleteStaff,
} from '../redux/slices/staffSlice';

interface AuthContextType {
  currentUser: AuthUser | null;
  staffList: StaffUser[];
  login: (user: AuthUser) => void;
  logout: () => void;
  addStaffUser: (user: StaffUser) => Promise<void>;
  toggleStaffStatus: (id: string) => Promise<void>;
  updateStaffPermissions: (id: string, modulePermissions: ModulePermission) => Promise<void>;
  updateStaffPassword: (id: string, newPassword: string) => Promise<void>;
  updateStaffUser: (id: string, updatedData: Partial<StaffUser>) => Promise<void>;
  deleteStaffUser: (id: string) => Promise<void>;
  refreshStaff: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const staffList = useAppSelector((state) => state.staff.staffList);

  // On mount: Fetch dynamic staff from backend and verify session
  useEffect(() => {
    dispatch(fetchStaffList());
    if (typeof window !== 'undefined' && localStorage.getItem('arpan_auth_token')) {
      dispatch(verifySession());
    }
  }, [dispatch]);

  const login = (user: AuthUser) => {
    dispatch(setCurrentUser(user));
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  const refreshStaff = () => {
    dispatch(fetchStaffList());
  };

  const addStaffUser = async (user: StaffUser) => {
    try {
      await dispatch(
        addStaffMember({
          name: user.name,
          email: user.email,
          staffId: user.staffId,
          department: user.department,
          role: user.role,
          modulePermissions: user.modulePermissions,
          password: user.password || 'staff123',
        })
      ).unwrap();
    } catch (e) {
      console.warn('Backend sync failed:', e);
      throw e;
    }
  };

  const toggleStaffStatus = async (id: string) => {
    const target = staffList.find((s) => s.id === id || s.staffId === id);
    const currentActive = target ? target.active : true;
    dispatch(localToggleStatus(id));
    try {
      await dispatch(
        toggleStaffMemberStatus({
          id,
          currentActive,
        })
      ).unwrap();
    } catch (e) {
      console.warn('Backend toggle failed:', e);
      dispatch(fetchStaffList());
      throw e;
    }
  };

  const updateStaffPermissions = async (id: string, modulePermissions: ModulePermission) => {
    dispatch(localUpdateStaff({ id, updatedData: { modulePermissions } }));
    try {
      await dispatch(
        updateStaffMember({
          id,
          updatedData: { modulePermissions },
        })
      ).unwrap();
    } catch (e) {
      console.warn('Backend update failed:', e);
      dispatch(fetchStaffList());
      throw e;
    }
  };

  const updateStaffPassword = async (id: string, newPassword: string) => {
    dispatch(localUpdateStaff({ id, updatedData: { password: newPassword } }));
    try {
      await dispatch(
        updateStaffMember({
          id,
          updatedData: { password: newPassword },
        })
      ).unwrap();
    } catch (e) {
      console.warn('Backend password update failed:', e);
      dispatch(fetchStaffList());
      throw e;
    }
  };

  const updateStaffUser = async (id: string, updatedData: Partial<StaffUser>) => {
    dispatch(localUpdateStaff({ id, updatedData }));
    try {
      await dispatch(
        updateStaffMember({
          id,
          updatedData,
        })
      ).unwrap();
    } catch (e) {
      console.warn('Backend staff update failed:', e);
      dispatch(fetchStaffList());
      throw e;
    }
  };

  const deleteStaffUser = async (id: string) => {
    dispatch(localDeleteStaff(id));
    try {
      await dispatch(deleteStaffMember(id)).unwrap();
    } catch (e) {
      console.warn('Backend delete failed:', e);
      dispatch(fetchStaffList());
      throw e;
    }
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
        updateStaffPassword,
        updateStaffUser,
        deleteStaffUser,
        refreshStaff,
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
