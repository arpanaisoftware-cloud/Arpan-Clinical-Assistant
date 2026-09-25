'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper
} from '@mui/material';
import { ArrowBack, Lock } from '@mui/icons-material';
import Header from '../../components/Header';
import StaffManagementModule from '../../components/StaffManagementModule';
import { useAuth } from '../../context/AuthContext';
import { ColorModeContext } from '../../theme/ThemeRegistry';

export default function StaffManagementPage() {
  const router = useRouter();
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const {
    currentUser,
    staffList,
    logout,
    addStaffUser,
    toggleStaffStatus
  } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!currentUser) {
    return null;
  }

  const userRole = currentUser.role || 'Doctor';
  const canAccessStaffMgmt = userRole === 'Doctor' || currentUser.modulePermissions === 'Full Access';

  return (
    <Box sx={{ minHeight: '100vh', pb: 8, bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Top Application Navigation Header */}
      <Header
        mode={mode}
        onToggleMode={toggleColorMode}
        onNewRx={() => router.push('/')}
        onUploadClick={() => router.push('/')}
        onOpenCopilot={() => router.push('/')}
        activeModuleTab={3}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenManageStaff={() => {}}
      />

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {/* Navigation Breadcrumb / Top Bar */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 1,
            bgcolor: mode === 'dark' ? 'rgba(108, 92, 231, 0.12)' : 'rgba(108, 92, 231, 0.06)',
            borderColor: '#6C5CE7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#6C5CE7', lineHeight: 1.2 }}>
              Staff &amp; User Access Management Workspace
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Dedicated Clinical Administration &amp; Roster Control Portal
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/')}
            sx={{ borderRadius: 1, fontWeight: 800, textTransform: 'none' }}
          >
            Return to Clinical Workspaces
          </Button>
        </Paper>

        {/* Staff Management Content */}
        {canAccessStaffMgmt ? (
          <StaffManagementModule
            staffList={staffList}
            onAddStaff={addStaffUser}
            onToggleStatus={toggleStaffStatus}
          />
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 5,
              borderRadius: 1,
              textAlign: 'center',
              bgcolor: 'rgba(255, 77, 109, 0.04)',
              borderColor: 'rgba(255, 77, 109, 0.3)',
              my: 4
            }}
          >
            <Lock sx={{ color: '#FF4D6D', fontSize: 44, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#FF4D6D' }}>
              Staff Access Restricted
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              Your account <strong>{currentUser.name}</strong> does not have administrator privileges to manage clinic staff accounts.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBack />}
              onClick={() => router.push('/')}
              sx={{ fontWeight: 800 }}
            >
              Return to Clinical Workspaces
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
