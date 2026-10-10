'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Button,
  Chip,
} from '@mui/material';
import DevicesOther from '@mui/icons-material/DevicesOther';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { toast } from 'react-toastify';
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
  logout: () => Promise<void>;
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
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const staffList = useAppSelector((state) => state.staff.staffList);

  // 10-Second Session Terminated Popup Modal State
  const [sessionTerminatedModal, setSessionTerminatedModal] = useState<{
    open: boolean;
    message: string;
    countdown: number;
  }>({
    open: false,
    message: '',
    countdown: 10,
  });

  // On mount: Fetch dynamic staff from backend and verify session only if token exists
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('arpan_auth_token')) {
      dispatch(fetchStaffList());
      dispatch(verifySession());
    }
  }, [dispatch]);

  // Listen for session invalidation (e.g. logged in on another device or revoked)
  useEffect(() => {
    const handleSessionTerminated = (e: any) => {
      const isOther = !!e.detail?.loggedOutByOtherDevice;
      const msg =
        e.detail?.message ||
        (isOther
          ? 'Your account has been logged in on another device. You have been automatically logged out.'
          : 'Session expired. Please sign in again.');

      // Clear Redux state & localStorage immediately
      dispatch(setCurrentUser(null));
      if (typeof window !== 'undefined') {
        localStorage.removeItem('arpan_auth_user');
        localStorage.removeItem('arpan_auth_token');
      }

      toast.error(`⚠️ ${msg}`, {
        toastId: 'session-superseded',
        autoClose: 10000,
      });

      // Launch the 10-second popup modal
      setSessionTerminatedModal({
        open: true,
        message: msg,
        countdown: 10,
      });
    };

    window.addEventListener('session-terminated-by-other-device', handleSessionTerminated);
    return () => {
      window.removeEventListener('session-terminated-by-other-device', handleSessionTerminated);
    };
  }, [dispatch]);

  // 10-Second countdown timer effect for session termination popup
  useEffect(() => {
    if (!sessionTerminatedModal.open) return;

    if (sessionTerminatedModal.countdown <= 0) {
      setSessionTerminatedModal((prev) => ({ ...prev, open: false }));
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        router.push('/login');
      }
      return;
    }

    const timer = setTimeout(() => {
      setSessionTerminatedModal((prev) => ({
        ...prev,
        countdown: prev.countdown - 1,
      }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [sessionTerminatedModal.open, sessionTerminatedModal.countdown, router]);

  const handleCloseSessionModal = () => {
    setSessionTerminatedModal((prev) => ({ ...prev, open: false }));
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      router.push('/login');
    }
  };

  // Periodic heartbeat + focus/visibility listener to immediately detect other device logins
  useEffect(() => {
    if (!currentUser) return;

    let isChecking = false;
    const checkActiveSession = async () => {
      if (isChecking) return;
      const token = typeof window !== 'undefined' ? localStorage.getItem('arpan_auth_token') : null;
      if (!token) return;

      isChecking = true;
      try {
        await dispatch(verifySession()).unwrap();
      } catch (err: any) {
        // verifySession thunk triggers axiosClient interceptor on 401,
        // which broadcasts session-terminated-by-other-device
      } finally {
        isChecking = false;
      }
    };

    // Heartbeat check every 10 seconds (10000ms) while user is logged in
    const intervalId = setInterval(checkActiveSession, 10000);

    // Instant check when user focuses or returns to the browser tab
    const handleFocus = () => {
      checkActiveSession();
    };
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        checkActiveSession();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentUser, dispatch]);

  const login = (user: AuthUser) => {
    dispatch(setCurrentUser(user));
    dispatch(fetchStaffList());
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (e) {
      console.warn('Logout dispatch error:', e);
    }
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
      dispatch(fetchStaffList());
      if (
        currentUser &&
        (currentUser.id === id || (currentUser as any).staffId === id || currentUser.email === updatedData.email)
      ) {
        dispatch(
          setCurrentUser({
            ...currentUser,
            name: updatedData.name || currentUser.name,
            email: updatedData.email || currentUser.email,
            role: updatedData.role || currentUser.role,
            modulePermissions: updatedData.modulePermissions || currentUser.modulePermissions,
            department: updatedData.department || currentUser.department,
            staffId: updatedData.staffId || (currentUser as any).staffId,
          })
        );
      }
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

      {/* ─── 10-SECOND POPUP MODAL FOR MULTI-DEVICE SESSION LOGOUT ─── */}
      <Dialog
        open={sessionTerminatedModal.open}
        disableEscapeKeyDown
        onClose={(_, reason) => {
          if (reason === 'backdropClick') return;
        }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: { xs: 2.5, sm: 3.5 },
            maxWidth: 460,
            width: '92%',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            overflow: 'hidden',
            position: 'relative',
          },
        }}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(15, 23, 42, 0.78)',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Glowing Animated Icon Badge */}
          <Box
            sx={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              bgcolor: 'rgba(239, 68, 68, 0.12)',
              border: '2px solid rgba(239, 68, 68, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
              boxShadow: '0 0 35px rgba(239, 68, 68, 0.3)',
            }}
          >
            <DevicesOther sx={{ color: '#EF4444', fontSize: 40 }} />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.02em',
              mb: 1.2,
              color: '#EF4444',
            }}
          >
            Session Terminated
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.6,
              mb: 3,
              fontSize: '0.96rem',
            }}
          >
            {sessionTerminatedModal.message ||
              'Your account has been logged in on another device. For clinical security and privacy compliance, this session has been automatically closed.'}
          </Typography>

          {/* 10-Second Depletion Progress Bar */}
          <Box sx={{ width: '100%', mb: 2.5 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.8,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Redirecting in:
              </Typography>
              <Chip
                label={`${sessionTerminatedModal.countdown}s remaining`}
                size="small"
                sx={{
                  bgcolor: 'rgba(239, 68, 68, 0.12)',
                  color: '#EF4444',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              />
            </Box>
            {/* 10-Second Continuous Silk-Smooth Progress Bar */}
            <Box
              sx={{
                width: '100%',
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(239, 68, 68, 0.12)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Box
                key={sessionTerminatedModal.open ? 'countdown-running' : 'countdown-idle'}
                sx={{
                  height: '100%',
                  width: '100%',
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #EF4444 0%, #F59E0B 100%)',
                  transformOrigin: 'left center',
                  animation: sessionTerminatedModal.open ? 'drainProgress 10s linear forwards' : 'none',
                  '@keyframes drainProgress': {
                    '0%': { transform: 'scaleX(1)' },
                    '100%': { transform: 'scaleX(0)' },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Action Button: Sign In Again Now */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleCloseSessionModal}
            endIcon={<ArrowForward />}
            sx={{
              py: 1.3,
              fontWeight: 800,
              fontSize: '0.95rem',
              borderRadius: 2.5,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              boxShadow: '0 10px 20px rgba(239, 68, 68, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                boxShadow: '0 12px 24px rgba(239, 68, 68, 0.45)',
              },
            }}
          >
            Sign In Again Now
          </Button>
        </DialogContent>
      </Dialog>
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
