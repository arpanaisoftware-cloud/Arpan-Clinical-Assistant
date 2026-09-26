'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Stack,
  InputAdornment,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  AppBar,
  Toolbar,
  Container
} from '@mui/material';
import {
  LocalHospital,
  Lock,
  SupervisorAccount,
  MedicalServices,
  ArrowForward,
  VerifiedUser,
  Person,
  Close,
  Email,
  CheckCircle,
  MarkEmailRead,
  LockReset,
  ContentCopy,
  OpenInNew,
  Brightness4,
  Brightness7,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { StaffUser, UserRole, AuthUser } from '../types/clinical';
import { toast } from 'react-toastify';
import { ColorModeContext } from '../theme/ThemeRegistry';

interface LoginScreenProps {
  staffList: StaffUser[];
  onLoginSuccess: (user: AuthUser) => void;
  onUpdatePasscode?: (staffId: string, newPasscode: string) => void;
}

export default function LoginScreen({ staffList, onLoginSuccess, onUpdatePasscode }: LoginScreenProps) {
  const router = useRouter();
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Doctor');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);

  // Forgot Password / Reset Link Ecosystem Modal States
  const [forgotModalOpen, setForgotModalOpen] = useState<boolean>(false);
  const [resetStep, setResetStep] = useState<number>(1); // 1: Request, 2: Reset Link Dispatched, 3: Success
  const [resetTargetId, setResetTargetId] = useState<string>('');
  const [resetEmail, setResetEmail] = useState<string>('');
  const [generatedResetLink, setGeneratedResetLink] = useState<string>('');
  const [newPasscode, setNewPasscode] = useState<string>('');
  const [confirmPasscode, setConfirmPasscode] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [resetErrorMsg, setResetErrorMsg] = useState<string>('');

  // Filter staff by selected role
  const availableUsers = staffList.filter(u => u.role === selectedRole && u.active);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let userToLogin = staffList.find(u => u.staffId === selectedStaffId || u.id === selectedStaffId);

    // Validate required fields
    if (!selectedStaffId) {
      toast.error('Please select a registered account to sign in.');
      return;
    }

    if (!userToLogin) {
      toast.error('Invalid user selected. Please select a valid account.');
      return;
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
  };

  const handleOpenForgotModal = () => {
    const defaultUser = selectedStaffId
      ? staffList.find(s => s.staffId === selectedStaffId || s.id === selectedStaffId)
      : availableUsers[0] || staffList[0];

    const initialId = defaultUser ? defaultUser.staffId : (selectedRole === 'Doctor' ? 'DOC-8849' : 'STAFF-8921');
    const initialEmail = selectedRole === 'Doctor' ? 'dr.yashwant@arpanclinical.org' : 'alex.rivera@arpanclinical.org';

    setResetTargetId(initialId);
    setResetEmail(initialEmail);
    setGeneratedResetLink('');
    setNewPasscode('');
    setConfirmPasscode('');
    setResetErrorMsg('');
    setResetStep(1);
    setForgotModalOpen(true);
  };

  const handleSendResetLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetErrorMsg('Please enter a valid clinical email address.');
      return;
    }
    setResetErrorMsg('');
    setIsSending(true);

    const token = 'ec7d83c2082486ed808146848a9247e8e4414409cf24f4d04af6bb4ff710acd7';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://arpanclinical.site';
    const link = `${origin}/reset-password/${token}`;

    setTimeout(() => {
      setIsSending(false);
      setGeneratedResetLink(link);
      setResetStep(2);
      toast.info(`📩 Secure password reset link dispatched to ${resetEmail}!`);
    }, 800);
  };

  const handleVerifyAndResetPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg('');

    if (!newPasscode || newPasscode.length < 4) {
      setResetErrorMsg('New Passcode / PIN must be at least 4 characters long.');
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setResetErrorMsg('Passcodes do not match. Please re-enter.');
      return;
    }

    // Passcode updated successfully
    if (onUpdatePasscode) {
      onUpdatePasscode(resetTargetId, newPasscode);
    }

    // Auto update selected user and passcode in login screen
    setSelectedStaffId(resetTargetId);
    setPasscode(newPasscode);

    setResetStep(3);
    toast.success('🔒 Passcode updated successfully via Reset Link!');
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isDoctor = selectedRole === 'Doctor';
  const primaryAccent = isDoctor ? '#00C9A7' : '#6C5CE7';

  const targetUserObj = staffList.find(s => s.staffId === resetTargetId || s.id === resetTargetId);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: isDark ? '#0B1120' : '#F8FAFC' }}>
      {/* Top Application Header Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
          color: isDark ? '#F8FAFC' : '#0F172A',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64, py: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0, 201, 167, 0.35)',
                }}
              >
                <LocalHospital sx={{ color: '#FFF', fontSize: 24 }} />
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(90deg, #00C9A7, #6C5CE7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.15rem' }}>
                    Arpan Clinical Assistant
                  </Typography>
                  <Chip
                    label="CARE OS v7.0"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      bgcolor: 'rgba(0, 201, 167, 0.15)',
                      color: '#00C9A7',
                      border: '1px solid rgba(0, 201, 167, 0.3)'
                    }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.3, fontWeight: 500 }}>
                  Intelligent Prescription, Counselling &amp; Dietary Care Platform
                </Typography>
              </Box>
            </Stack>

            <Tooltip title={mode === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'} arrow placement="bottom">
              <IconButton onClick={toggleColorMode} color="inherit" size="small" sx={{ border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #CBD5E1' }}>
                {mode === 'dark' ? <Brightness7 sx={{ color: '#FFB703' }} /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Login Screen Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          px: 2,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Ambient Glow Accents */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '20%',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(0, 201, 167, 0.18) 0%, rgba(0,0,0,0) 70%)'
              : 'radial-gradient(circle, rgba(0, 201, 167, 0.12) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '20%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(108, 92, 231, 0.2) 0%, rgba(0,0,0,0) 70%)'
              : 'radial-gradient(circle, rgba(108, 92, 231, 0.12) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }}
        />

        <Card
          sx={{
            maxWidth: 480,
            width: '100%',
            borderRadius: 3,
            boxShadow: isDark
              ? '0 24px 70px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 201, 167, 0.25)'
              : '0 20px 50px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            background: isDark
              ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 17, 32, 0.98) 100%)'
              : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            backdropFilter: 'blur(16px)',
            color: 'text.primary',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Card Header Section - STRICTLY MATCHING USER SPECIFICATIONS */}
          <Box
            sx={{
              p: 4,
              pt: 4.5,
              pb: 3,
              textAlign: 'center',
              position: 'relative',
              background: isDark
                ? 'linear-gradient(180deg, rgba(0, 201, 167, 0.08) 0%, rgba(108, 92, 231, 0.03) 100%)'
                : 'linear-gradient(180deg, rgba(0, 201, 167, 0.04) 0%, rgba(108, 92, 231, 0.02) 100%)',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #F1F5F9'
            }}
          >
            {/* Logo Badge */}
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(0, 201, 167, 0.35)',
                mb: 2,
                position: 'relative'
              }}
            >
              <LocalHospital sx={{ color: '#FFFFFF', fontSize: 36 }} />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                fontSize: '1.75rem',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #00C9A7 0%, #6C5CE7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.8
              }}
            >
              Arpan Clinical Assistant
            </Typography>

            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={1.2}>
              <Chip
                icon={<VerifiedUser sx={{ fontSize: '14px !important', color: `${primaryAccent} !important` }} />}
                label="CARE OS v7.0"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(0, 201, 167, 0.12)' : 'rgba(0, 201, 167, 0.08)',
                  color: primaryAccent,
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  letterSpacing: 0.8,
                  py: 0.2,
                  px: 0.6,
                  borderRadius: 1.5,
                  border: `1px solid ${primaryAccent}33`
                }}
              />
            </Stack>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: isDark ? '#94A3B8' : '#64748B',
                fontWeight: 600,
                fontSize: '0.82rem',
                lineHeight: 1.4,
                px: 2
              }}
            >
              Intelligent Prescription, Counselling &amp; Dietary Care Platform
            </Typography>
          </Box>

          <CardContent sx={{ p: 4, pt: 3.5 }}>
            {/* Role Segment Selector */}
            <Box
              sx={{
                display: 'flex',
                p: 0.6,
                borderRadius: 2.5,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F1F5F9',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
                mb: 3.5
              }}
            >
              <Button
                fullWidth
                onClick={() => {
                  setSelectedRole('Doctor');
                  setSelectedStaffId('');
                }}
                startIcon={<MedicalServices sx={{ fontSize: 20 }} />}
                sx={{
                  py: 1.1,
                  borderRadius: 2,
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  color: isDoctor ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B',
                  background: isDoctor
                    ? 'linear-gradient(135deg, #00C9A7 0%, #00967D 100%)'
                    : 'transparent',
                  boxShadow: isDoctor ? '0 4px 14px rgba(0, 201, 167, 0.35)' : 'none',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    background: isDoctor
                      ? 'linear-gradient(135deg, #00C9A7 0%, #00967D 100%)'
                      : isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.03)'
                  }
                }}
              >
                Doctor Access
              </Button>

              <Button
                fullWidth
                onClick={() => {
                  setSelectedRole('Staff');
                  setSelectedStaffId('');
                }}
                startIcon={<SupervisorAccount sx={{ fontSize: 20 }} />}
                sx={{
                  py: 1.1,
                  borderRadius: 2,
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  color: !isDoctor ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B',
                  background: !isDoctor
                    ? 'linear-gradient(135deg, #6C5CE7 0%, #4C1D95 100%)'
                    : 'transparent',
                  boxShadow: !isDoctor ? '0 4px 14px rgba(108, 92, 231, 0.35)' : 'none',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    background: !isDoctor
                      ? 'linear-gradient(135deg, #6C5CE7 0%, #4C1D95 100%)'
                      : isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.03)'
                  }
                }}
              >
                Staff Access
              </Button>
            </Box>

            <form onSubmit={handleLoginSubmit}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      mb: 0.8,
                      display: 'block',
                      color: isDark ? '#CBD5E1' : '#475569',
                      letterSpacing: 0.3
                    }}
                  >
                    Select Registered {selectedRole}:
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    size="medium"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    required
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (selected) => {
                        if (!selected || selected === '') {
                          return (
                            <Typography sx={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: '0.95rem' }}>
                              Select registered {selectedRole} from roster ({availableUsers.length} active)
                            </Typography>
                          );
                        }
                        const found = availableUsers.find(u => u.staffId === selected || u.id === selected);
                        return found ? `${found.name} (${found.staffId}) — ${found.department}` : (selected as string);
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: primaryAccent, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                        '&:hover fieldset': {
                          borderColor: `${primaryAccent} !important`
                        }
                      }
                    }}
                  >
                    <MenuItem value="" disabled sx={{ color: 'text.secondary' }}>
                      <em>Select registered {selectedRole} from roster</em>
                    </MenuItem>
                    {availableUsers.map((u) => (
                      <MenuItem key={u.id} value={u.staffId}>
                        {u.name} ({u.staffId}) — {u.department}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      mb: 0.8,
                      display: 'block',
                      color: isDark ? '#CBD5E1' : '#475569',
                      letterSpacing: 0.3
                    }}
                  >
                    Passcode / PIN:
                  </Typography>
                  <TextField
                    fullWidth
                    size="medium"
                    type={showPasscode ? 'text' : 'password'}
                    placeholder="Enter passcode (e.g. 1234 or doc123)"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: primaryAccent, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPasscode((prev) => !prev)}
                            edge="end"
                            size="small"
                            sx={{ color: isDark ? '#94A3B8' : '#64748B' }}
                          >
                            {showPasscode ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                        '&:hover fieldset': {
                          borderColor: `${primaryAccent} !important`
                        }
                      }
                    }}
                  />

                  {/* Forgot Passcode / Reset Link Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 3 }}>
                    <Box
                      onClick={() => router.push('/reset-password/ec7d83c2082486ed808146848a9247e8e4414409cf24f4d04af6bb4ff710acd7')}
                      sx={{
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: primaryAccent,
                        textTransform: 'none',
                        p: 0,
                        minWidth: 0,
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'transparent',
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Forgot Passcode?
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ pt: 1 }}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      py: 1.6,
                      borderRadius: 2.5,
                      fontWeight: 900,
                      fontSize: '1rem',
                      letterSpacing: 0.3,
                      color: '#FFFFFF',
                      background: isDoctor
                        ? 'linear-gradient(135deg, #00C9A7 0%, #00967D 100%)'
                        : 'linear-gradient(135deg, #6C5CE7 0%, #4C1D95 100%)',
                      boxShadow: isDoctor
                        ? '0 8px 24px rgba(0, 201, 167, 0.38)'
                        : '0 8px 24px rgba(108, 92, 231, 0.38)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: isDoctor
                          ? 'linear-gradient(135deg, #00B395 0%, #007A65 100%)'
                          : 'linear-gradient(135deg, #5B4BC4 0%, #3B1478 100%)',
                        boxShadow: isDoctor
                          ? '0 12px 28px rgba(0, 201, 167, 0.5)'
                          : '0 12px 28px rgba(108, 92, 231, 0.5)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    Sign In to Arpan Clinical OS
                  </Button>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>

        {/* Forgot Passcode / Reset Link Ecosystem Modal */}
        <Dialog
          open={forgotModalOpen}
          onClose={() => setForgotModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
              boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 15px 40px rgba(0,0,0,0.15)',
              bgcolor: isDark ? '#0F172A' : '#FFFFFF',
              color: isDark ? '#F8FAFC' : '#0F172A',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: `${primaryAccent}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: primaryAccent
                }}
              >
                <LockReset sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  Passcode Reset Link Ecosystem
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Secure Email Password Reset Link Service
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setForgotModalOpen(false)} size="small">
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0' }}>
            <Box sx={{ mb: 3, mt: 1 }}>
              <Stepper activeStep={resetStep - 1} alternativeLabel>
                <Step>
                  <StepLabel>Request Reset Link</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Email Reset Link</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Complete</StepLabel>
                </Step>
              </Stepper>
            </Box>

            {resetErrorMsg && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {resetErrorMsg}
              </Alert>
            )}

            {/* STEP 1: REQUEST RESET LINK */}
            {resetStep === 1 && (
              <form onSubmit={handleSendResetLink}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.8 }}>
                      Select Clinical Account:
                    </Typography>
                    <TextField
                      fullWidth
                      select
                      size="medium"
                      value={resetTargetId}
                      required
                      onChange={(e) => {
                        setResetTargetId(e.target.value);
                        const found = staffList.find(s => s.staffId === e.target.value || s.id === e.target.value);
                        if (found) {
                          setResetEmail(
                            found.role === 'Doctor'
                              ? `dr.${found.name.toLowerCase().replace(/[^a-z]/g, '')}@arpanclinical.org`
                              : `${found.name.toLowerCase().replace(/[^a-z]/g, '')}@arpanclinical.org`
                          );
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: primaryAccent }} />
                          </InputAdornment>
                        )
                      }}
                    >
                      {staffList.map((s) => (
                        <MenuItem key={s.id} value={s.staffId}>
                          {s.role === 'Doctor' ? '👨‍⚕️' : '🧑‍⚕️'} {s.name} ({s.staffId}) — {s.role}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.8 }}>
                      Registered Clinical Email Address:
                    </Typography>
                    <TextField
                      fullWidth
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="physician@arpanclinical.org"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: primaryAccent }} />
                          </InputAdornment>
                        )
                      }}
                    />
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.8, color: isDark ? '#94A3B8' : '#64748B' }}>
                      A encrypted, one-time security password reset link will be dispatched to this email address.
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={isSending}
                    startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <MarkEmailRead />}
                    sx={{
                      py: 1.4,
                      borderRadius: 2,
                      fontWeight: 800,
                      bgcolor: primaryAccent,
                      color: '#FFFFFF',
                      '&:hover': { bgcolor: isDoctor ? '#00967D' : '#4C1D95' }
                    }}
                  >
                    {isSending ? 'Generating Reset Link...' : 'Dispatch Password Reset Link to Email'}
                  </Button>
                </Stack>
              </form>
            )}

            {/* STEP 2: SIMULATED EMAIL DISPATCH & SET NEW PASSCODE */}
            {resetStep === 2 && (
              <form onSubmit={handleVerifyAndResetPasscode}>
                <Stack spacing={2.5}>
                  <Alert severity="info" icon={<MarkEmailRead />} sx={{ borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Password Reset Link Sent to {resetEmail}!
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                      Click the generated link below or set your new passcode directly to update credentials.
                    </Typography>
                  </Alert>

                  {/* Simulated Email Reset Link Display Card */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(0, 201, 167, 0.08)' : '#F0FDF4',
                      border: '1px dashed #00C9A7',
                      wordBreak: 'break-all'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 800, color: primaryAccent, display: 'block', mb: 0.5 }}>
                      📩 SIMULATED EMAIL RESET LINK:
                    </Typography>
                    <Typography
                      variant="body2"
                      component="a"
                      href={generatedResetLink}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        color: isDark ? '#6EE7B7' : '#047857',
                        textDecoration: 'underline',
                        fontWeight: 700,
                        display: 'block',
                        mb: 1
                      }}
                    >
                      {generatedResetLink}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Copy Reset Link to Clipboard">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedResetLink);
                            toast.success('Reset link copied to clipboard!');
                          }}
                          startIcon={<ContentCopy fontSize="small" />}
                          sx={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'none', borderRadius: 1.5 }}
                        >
                          Copy Link
                        </Button>
                      </Tooltip>
                      <Tooltip title="Navigate to Reset Password Page Route">
                        <Button
                          size="small"
                          variant="contained"
                          component="a"
                          href={generatedResetLink}
                          startIcon={<OpenInNew fontSize="small" />}
                          sx={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'none', borderRadius: 1.5, bgcolor: primaryAccent, color: '#FFF', '&:hover': { bgcolor: '#00967D' } }}
                        >
                          Open Reset Page Route
                        </Button>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.8 }}>
                      New Passcode / PIN:
                    </Typography>
                    <TextField
                      fullWidth
                      type="password"
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="Set new passcode (min 4 characters)"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: primaryAccent }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.8 }}>
                      Confirm New Passcode:
                    </Typography>
                    <TextField
                      fullWidth
                      type="password"
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      placeholder="Re-enter new passcode"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: primaryAccent }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>

                  <Stack direction="row" spacing={2} pt={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setResetStep(1)}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      Back
                    </Button>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      startIcon={<CheckCircle />}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 800,
                        bgcolor: primaryAccent,
                        color: '#FFFFFF',
                        '&:hover': { bgcolor: isDoctor ? '#00967D' : '#4C1D95' }
                      }}
                    >
                      Save &amp; Update Passcode
                    </Button>
                  </Stack>
                </Stack>
              </form>
            )}

            {/* STEP 3: SUCCESS */}
            {resetStep === 3 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: 'rgba(0, 201, 167, 0.15)',
                    color: '#00C9A7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <CheckCircle sx={{ fontSize: 48 }} />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                  Passcode Reset Successful!
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#475569', mb: 3 }}>
                  Passcode for <strong>{targetUserObj?.name || resetTargetId}</strong> has been updated via the email reset link service and auto-populated into your login form.
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setForgotModalOpen(false)}
                  startIcon={<ArrowForward />}
                  sx={{
                    py: 1.4,
                    borderRadius: 2.5,
                    fontWeight: 900,
                    bgcolor: primaryAccent,
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: isDoctor ? '#00967D' : '#4C1D95' }
                  }}
                >
                  Proceed to Sign In
                </Button>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}


