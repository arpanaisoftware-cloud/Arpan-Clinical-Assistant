'use client';

import React, { useState, useContext, useEffect } from 'react';
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
  IconButton,
  Alert,
  Tooltip,
  AppBar,
  Toolbar,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  LocalHospital,
  Lock,
  ArrowForward,
  VerifiedUser,
  Person,
  LockReset,
  CheckCircle,
  Brightness4,
  Brightness7,
  VpnKey,
  ArrowBack,
  Email,
  MarkEmailRead,
  Visibility,
  VisibilityOff,
  Security,
  ShieldOutlined
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { ColorModeContext } from '../theme/ThemeRegistry';
import { toast } from 'react-toastify';

interface ResetPasswordScreenProps {
  token?: string;
}

export default function ResetPasswordScreen({ token }: ResetPasswordScreenProps) {
  const router = useRouter();
  const { staffList, updateStaffPasscode } = useAuth();
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  // Stepper state (1: Request, 2: Set New Password, 3: Success)
  const [resetStep, setResetStep] = useState<number>(token ? 2 : 1);
  const [resetTargetId, setResetTargetId] = useState<string>(staffList[0]?.staffId || 'DOC-8849');
  const [resetEmail, setResetEmail] = useState<string>('dr.yashwant@arpanclinical.org');
  const [newPasscode, setNewPasscode] = useState<string>('');
  const [confirmPasscode, setConfirmPasscode] = useState<string>('');
  const [showNewPasscode, setShowNewPasscode] = useState<boolean>(false);
  const [showConfirmPasscode, setShowConfirmPasscode] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [resetErrorMsg, setResetErrorMsg] = useState<string>('');

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primaryAccent = '#00C9A7';
  const secondaryAccent = '#6C5CE7';

  const targetUserObj = staffList.find(s => s.staffId === resetTargetId || s.id === resetTargetId);

  // Calculate passcode security strength (0 to 100)
  const getPasscodeStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Not Entered', color: '#94A3B8' };
    let score = 0;
    if (pass.length >= 4) score += 30;
    if (pass.length >= 6) score += 20;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 15;

    if (score < 40) return { score, label: 'Weak', color: '#EF4444' };
    if (score < 70) return { score, label: 'Good', color: '#F59E0B' };
    return { score, label: 'Strong', color: '#10B981' };
  };

  const strengthInfo = getPasscodeStrength(newPasscode);

  const handleSendResetLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetErrorMsg('Please enter a valid clinical email address.');
      return;
    }
    setResetErrorMsg('');
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setResetStep(2);
      toast.info(`📩 Security reset link verified for ${resetEmail}`);
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

    // Update passcode in Auth Context
    updateStaffPasscode(resetTargetId, newPasscode);

    setResetStep(3);
    toast.success('🔒 Passcode updated successfully!');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: isDark ? '#090D16' : '#F1F5F9' }}>
      {/* Top Application Header Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
          color: isDark ? '#F8FAFC' : '#0F172A',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64, py: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ cursor: 'pointer' }} onClick={() => router.push('/login')}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0, 201, 167, 0.4)',
                }}
              >
                <LocalHospital sx={{ color: '#FFF', fontSize: 24 }} />
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" sx={{ fontWeight: 900, background: 'linear-gradient(90deg, #00C9A7, #6C5CE7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.2rem', letterSpacing: '-0.01em' }}>
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
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.3, fontWeight: 600 }}>
                  Intelligent Prescription, Counselling &amp; Dietary Care Platform
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBack />}
                onClick={() => router.push('/login')}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  px: 2,
                  py: 0.7,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.15)',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  '&:hover': {
                    borderColor: '#00C9A7',
                    bgcolor: 'rgba(0, 201, 167, 0.08)',
                    color: '#00C9A7'
                  }
                }}
              >
                Return to Login
              </Button>

              <Tooltip title={mode === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'} arrow placement="bottom">
                <IconButton onClick={toggleColorMode} color="inherit" size="small" sx={{ border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #CBD5E1', borderRadius: '12px', p: 1 }}>
                  {mode === 'dark' ? <Brightness7 sx={{ color: '#FFB703' }} /> : <Brightness4 />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content Area with Glowing Accents */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 2,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Ambient Glow Accents */}
        <Box
          sx={{
            position: 'absolute',
            top: '8%',
            left: '18%',
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(0, 201, 167, 0.2) 0%, rgba(0,0,0,0) 70%)'
              : 'radial-gradient(circle, rgba(0, 201, 167, 0.15) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '8%',
            right: '18%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(108, 92, 231, 0.22) 0%, rgba(0,0,0,0) 70%)'
              : 'radial-gradient(circle, rgba(108, 92, 231, 0.14) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none'
          }}
        />

        {/* Main Glassmorphic Reset Card */}
        <Card
          sx={{
            maxWidth: 520,
            width: '100%',
            borderRadius: 2,
            boxShadow: isDark
              ? '0 30px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 201, 167, 0.25)'
              : '0 25px 60px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.9)',
            background: isDark
              ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(11, 17, 32, 0.98) 100%)'
              : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            backdropFilter: 'blur(20px)',
            color: 'text.primary',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Card Top Banner */}
          <Box
            sx={{
              p: 4,
              pt: 4.5,
              pb: 3,
              textAlign: 'center',
              position: 'relative',
              background: isDark
                ? 'linear-gradient(180deg, rgba(0, 201, 167, 0.1) 0%, rgba(108, 92, 231, 0.04) 100%)'
                : 'linear-gradient(180deg, rgba(0, 201, 167, 0.05) 0%, rgba(108, 92, 231, 0.03) 100%)',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #F1F5F9'
            }}
          >
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: '22px',
                background: 'linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 28px rgba(0, 201, 167, 0.4)',
                mb: 2
              }}
            >
              <LockReset sx={{ color: '#FFFFFF', fontSize: 38 }} />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                fontSize: '1.7rem',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #00C9A7 0%, #6C5CE7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.8
              }}
            >
              Reset Clinical Passcode
            </Typography>

            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={1.2}>
              <Chip
                icon={<VpnKey sx={{ fontSize: '14px !important', color: `${primaryAccent} !important` }} />}
                label="ENCRYPTED AUTH PORTAL"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(0, 201, 167, 0.14)' : 'rgba(0, 201, 167, 0.09)',
                  color: primaryAccent,
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  letterSpacing: 0.8,
                  py: 0.2,
                  px: 0.8,
                  borderRadius: 2,
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
                fontSize: '0.84rem',
                lineHeight: 1.4,
                px: 2
              }}
            >
              Verify your security credentials and set up a new authorization passcode.
            </Typography>
          </Box>

          <CardContent sx={{ p: 4, pt: 3.5 }}>
            {/* STEPPER NAVIGATION */}
            <Box sx={{ mb: 3.5 }}>
              <Stepper
                activeStep={resetStep - 1}
                alternativeLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    color: isDark ? '#64748B' : '#94A3B8',
                    '&.Mui-active': {
                      color: primaryAccent,
                      fontWeight: 900
                    },
                    '&.Mui-completed': {
                      color: secondaryAccent
                    }
                  },
                  '& .MuiStepIcon-root': {
                    fontSize: 26,
                    color: isDark ? 'rgba(255,255,255,0.12)' : '#CBD5E1',
                    '&.Mui-active': {
                      color: primaryAccent
                    },
                    '&.Mui-completed': {
                      color: secondaryAccent
                    }
                  }
                }}
              >
                <Step>
                  <StepLabel>Request Link</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Set Passcode</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Complete</StepLabel>
                </Step>
              </Stepper>
            </Box>

            {resetErrorMsg && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5, fontWeight: 600 }}>
                {resetErrorMsg}
              </Alert>
            )}

            {/* STEP 1: REQUEST RESET LINK */}
            {resetStep === 1 && (
              <form onSubmit={handleSendResetLink}>
                <Stack spacing={2.8}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, mb: 0.8, display: 'block', color: isDark ? '#CBD5E1' : '#475569', letterSpacing: 0.3 }}>
                      Select Registered Clinical Account:
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
                            <Person sx={{ color: primaryAccent, fontSize: 22 }} />
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 2.5,
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                          '&:hover fieldset': { borderColor: `${primaryAccent} !important` }
                        }
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
                    <Typography variant="caption" sx={{ fontWeight: 800, mb: 0.8, display: 'block', color: isDark ? '#CBD5E1' : '#475569', letterSpacing: 0.3 }}>
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
                            <Email sx={{ color: primaryAccent, fontSize: 22 }} />
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 2.5,
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                          '&:hover fieldset': { borderColor: `${primaryAccent} !important` }
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.8, color: isDark ? '#94A3B8' : '#64748B', fontWeight: 500 }}>
                      An encrypted one-time security reset link will be dispatched to this address.
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSending}
                    startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <MarkEmailRead />}
                    sx={{
                      py: 1.6,
                      borderRadius: 2.5,
                      fontWeight: 900,
                      fontSize: '0.98rem',
                      letterSpacing: 0.3,
                      bgcolor: primaryAccent,
                      color: '#FFFFFF',
                      boxShadow: '0 8px 24px rgba(0, 201, 167, 0.38)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#00967D',
                        boxShadow: '0 12px 28px rgba(0, 201, 167, 0.5)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    {isSending ? 'Verifying Link Request...' : 'Dispatch Password Reset Link'}
                  </Button>
                </Stack>
              </form>
            )}

            {/* STEP 2: SET NEW PASSCODE */}
            {resetStep === 2 && (
              <form onSubmit={handleVerifyAndResetPasscode}>
                <Stack spacing={2.8}>
                  {/* Account Summary Strip */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: isDark ? 'rgba(0, 201, 167, 0.08)' : '#F0FDF4',
                      border: '1px solid rgba(0, 201, 167, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: primaryAccent, display: 'block' }}>
                        RECOVERY ACCOUNT VERIFIED
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        {targetUserObj?.name || resetTargetId} ({targetUserObj?.role || 'User'})
                      </Typography>
                    </Box>
                    <Chip
                      icon={<Security sx={{ fontSize: '14px !important', color: '#00C9A7 !important' }} />}
                      label="ACTIVE TOKEN"
                      size="small"
                      sx={{ bgcolor: 'rgba(0, 201, 167, 0.15)', color: '#00C9A7', fontWeight: 800, fontSize: '0.68rem' }}
                    />
                  </Paper>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, mb: 0.8, display: 'block', color: isDark ? '#CBD5E1' : '#475569', letterSpacing: 0.3 }}>
                      New Passcode / PIN:
                    </Typography>
                    <TextField
                      fullWidth
                      size="medium"
                      type={showNewPasscode ? 'text' : 'password'}
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="Set new passcode (min 4 characters)"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: primaryAccent, fontSize: 22 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowNewPasscode(!showNewPasscode)} edge="end" size="small">
                              {showNewPasscode ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 2.5,
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                          '&:hover fieldset': { borderColor: `${primaryAccent} !important` }
                        }
                      }}
                    />

                    {/* Passcode Security Indicator */}
                    {newPasscode && (
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600 }}>
                            Passcode Strength:
                          </Typography>
                          <Typography variant="caption" sx={{ color: strengthInfo.color, fontWeight: 900 }}>
                            {strengthInfo.label}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={strengthInfo.score}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: strengthInfo.color,
                              borderRadius: 3
                            }
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, mb: 0.8, display: 'block', color: isDark ? '#CBD5E1' : '#475569', letterSpacing: 0.3 }}>
                      Confirm New Passcode:
                    </Typography>
                    <TextField
                      fullWidth
                      size="medium"
                      type={showConfirmPasscode ? 'text' : 'password'}
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      placeholder="Re-enter new passcode"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: primaryAccent, fontSize: 22 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPasscode(!showConfirmPasscode)} edge="end" size="small">
                              {showConfirmPasscode ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 2.5,
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                          '&:hover fieldset': { borderColor: `${primaryAccent} !important` }
                        }
                      }}
                    />
                  </Box>

                  <Stack direction="row" spacing={2} pt={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setResetStep(1)}
                      sx={{
                        py: 1.4,
                        borderRadius: 2.5,
                        fontWeight: 800,
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1',
                        color: isDark ? '#F8FAFC' : '#475569'
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<CheckCircle />}
                      sx={{
                        py: 1.4,
                        borderRadius: 2.5,
                        fontWeight: 900,
                        fontSize: '0.95rem',
                        bgcolor: primaryAccent,
                        color: '#FFFFFF',
                        boxShadow: '0 8px 24px rgba(0, 201, 167, 0.38)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#00967D',
                          boxShadow: '0 12px 28px rgba(0, 201, 167, 0.5)',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      Save Passcode
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
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    bgcolor: 'rgba(0, 201, 167, 0.15)',
                    color: '#00C9A7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(0, 201, 167, 0.3)',
                    mb: 2.5
                  }}
                >
                  <CheckCircle sx={{ fontSize: 52 }} />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.01em' }}>
                  Passcode Reset Successful!
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#475569', mb: 3.5, px: 2, lineHeight: 1.5 }}>
                  Passcode for <strong>{targetUserObj?.name || resetTargetId}</strong> has been updated in Arpan Clinical Assistant.
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/login')}
                  endIcon={<ArrowForward />}
                  sx={{
                    py: 1.6,
                    borderRadius: 2.5,
                    fontWeight: 900,
                    fontSize: '1rem',
                    bgcolor: primaryAccent,
                    color: '#FFFFFF',
                    boxShadow: '0 10px 28px rgba(0, 201, 167, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#00967D',
                      boxShadow: '0 14px 32px rgba(0, 201, 167, 0.55)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Proceed to Sign In
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
