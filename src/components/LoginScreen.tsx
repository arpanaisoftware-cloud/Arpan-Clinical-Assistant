'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  Stack,
  Paper,
  Chip,
  Tabs,
  Tab,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  LocalHospital,
  Lock,
  Badge,
  SupervisorAccount,
  MedicalServices,
  ArrowForward,
  CheckCircle,
  VerifiedUser
} from '@mui/icons-material';
import { StaffUser, UserRole, AuthUser } from '../types/clinical';
import { toast } from 'react-toastify';

interface LoginScreenProps {
  staffList: StaffUser[];
  onLoginSuccess: (user: AuthUser) => void;
}

export default function LoginScreen({ staffList, onLoginSuccess }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Doctor');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');

  // Filter staff by selected role
  const availableUsers = staffList.filter(u => u.role === selectedRole && u.active);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let userToLogin = staffList.find(u => u.staffId === selectedStaffId || u.id === selectedStaffId);

    // Default fallback if no specific user selected from dropdown
    if (!userToLogin) {
      if (selectedRole === 'Doctor') {
        userToLogin = {
          id: 'ST-103',
          name: 'Dr. Yashwant Dubey',
          staffId: 'DOC-8849',
          department: 'Chief Cardiology & Internal Medicine',
          role: 'Doctor',
          modulePermissions: 'Full Access',
          active: true,
          createdAt: '2026-01-01'
        };
      } else {
        userToLogin = {
          id: 'ST-101',
          name: 'Nurse Alex Rivera',
          staffId: 'STAFF-8921',
          department: 'Diabetic & Chronic Care',
          role: 'Staff',
          modulePermissions: 'Counselling + Diets',
          active: true,
          createdAt: '2026-08-10'
        };
      }
    }

    const authenticatedUser: AuthUser = {
      id: userToLogin.id,
      name: userToLogin.name,
      staffId: userToLogin.staffId,
      role: userToLogin.role,
      modulePermissions: userToLogin.modulePermissions || (userToLogin.role === 'Doctor' ? 'Full Access' : 'Counselling + Diets'),
      department: userToLogin.department
    };

    onLoginSuccess(authenticatedUser);
    toast.success(`Welcome back, ${authenticatedUser.name}! (${authenticatedUser.modulePermissions})`);
  };

  const handleQuickLogin = (role: UserRole) => {
    if (role === 'Doctor') {
      onLoginSuccess({
        id: 'ST-103',
        name: 'Dr. Yashwant Dubey',
        staffId: 'DOC-8849',
        role: 'Doctor',
        modulePermissions: 'Full Access',
        department: 'Chief Cardiology & Internal Medicine'
      });
      toast.success('Signed in as Doctor (Full Access)');
    } else {
      onLoginSuccess({
        id: 'ST-101',
        name: 'Nurse Alex Rivera',
        staffId: 'STAFF-8921',
        role: 'Staff',
        modulePermissions: 'Counselling + Diets',
        department: 'Diabetic & Chronic Care'
      });
      toast.success('Signed in as Staff (Counselling + Diets)');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Card
        sx={{
          maxWidth: 540,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          background: 'linear-gradient(180deg, rgba(16, 24, 44, 0.96) 0%, rgba(10, 15, 29, 0.99) 100%)',
          border: '1px solid rgba(0, 201, 167, 0.35)',
          overflow: 'hidden'
        }}
      >
        {/* Card Header Banner */}
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(0, 201, 167, 0.15) 0%, rgba(108, 92, 231, 0.25) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 201, 167, 0.4)',
              mb: 1.5
            }}
          >
            <LocalHospital sx={{ color: '#FFF', fontSize: 32 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, background: 'linear-gradient(90deg, #00C9A7, #6C5CE7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Arpan Clinical Assistant
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, letterSpacing: 0.5 }}>
            AUTHENTICATED CLINICAL LOGIN & CARE OS
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Role Selection Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={selectedRole}
              onChange={(_e, val) => {
                setSelectedRole(val);
                setSelectedStaffId('');
              }}
              textColor="primary"
              indicatorColor="primary"
              variant="fullWidth"
            >
              <Tab
                value="Doctor"
                icon={<MedicalServices sx={{ color: '#00C9A7' }} />}
                iconPosition="start"
                label="Doctor Login"
                sx={{ fontWeight: 800 }}
              />
              <Tab
                value="Staff"
                icon={<SupervisorAccount sx={{ color: '#6C5CE7' }} />}
                iconPosition="start"
                label="Staff Login"
                sx={{ fontWeight: 800 }}
              />
            </Tabs>
          </Box>

          <form onSubmit={handleLoginSubmit}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: selectedRole === 'Doctor' ? '#00C9A7' : '#6C5CE7' }}>
                  Select {selectedRole} Account:
                </Typography>
                <TextField
                  fullWidth
                  select
                  size="medium"
                  label={`Select Registered ${selectedRole}`}
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select from clinic roster ({availableUsers.length} active)</em>
                  </MenuItem>
                  {availableUsers.map((u) => (
                    <MenuItem key={u.id} value={u.staffId}>
                      {u.name} ({u.staffId}) - {u.department}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Security Passcode / PIN:
                </Typography>
                <TextField
                  fullWidth
                  size="medium"
                  type="password"
                  placeholder="Enter passcode (e.g. 1234 or doc123)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                color={selectedRole === 'Doctor' ? 'primary' : 'secondary'}
                endIcon={<ArrowForward />}
                sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 800, fontSize: '1rem' }}
              >
                Sign In as {selectedRole}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>
            <Chip label="1-CLICK DEMO LOGIN" size="small" sx={{ fontSize: '0.7rem', fontWeight: 800 }} />
          </Divider>

          {/* Quick Demo Login Buttons */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<MedicalServices />}
                onClick={() => handleQuickLogin('Doctor')}
                sx={{ borderRadius: 2, fontSize: '0.82rem', py: 1, fontWeight: 700 }}
              >
                Login Doctor
              </Button>
            </Grid>

            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                startIcon={<SupervisorAccount />}
                onClick={() => handleQuickLogin('Staff')}
                sx={{ borderRadius: 2, fontSize: '0.82rem', py: 1, fontWeight: 700 }}
              >
                Login Staff
              </Button>
            </Grid>
          </Grid>

          {/* Module Access Explainer */}
          <Paper variant="outlined" sx={{ p: 2, mt: 3, borderRadius: 2.5, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <VerifiedUser sx={{ color: '#00C9A7', fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#00C9A7' }}>
                Role Access Specifications:
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem', lineHeight: 1.5 }}>
              • <strong>Doctor Role</strong>: Full Access to Prescriptions, Counselling, Diets, and Staff Management.<br />
              • <strong>Staff Role</strong>: Access to Counselling and Diets modules.
            </Typography>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
}
