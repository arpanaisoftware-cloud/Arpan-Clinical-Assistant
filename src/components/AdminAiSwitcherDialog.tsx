'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardActionArea,
  Stack,
  Chip,
  CircularProgress,
  IconButton,
  Divider,
  Alert,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Close,
  AutoAwesome,
  Psychology,
  CheckCircle,
  Speed,
  Security,
  MedicalServices,
  Bolt,
  Visibility,
  Hub,
  Refresh
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axiosClient from '../redux/api/axiosClient';

interface AdminAiSwitcherDialogProps {
  open: boolean;
  onClose: () => void;
  onProviderChanged?: (newProvider: 'gemini' | 'deepseek') => void;
}

export default function AdminAiSwitcherDialog({
  open,
  onClose,
  onProviderChanged
}: AdminAiSwitcherDialogProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeProvider, setActiveProvider] = useState<'gemini' | 'deepseek'>('gemini');
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(true);
  const [deepseekConfigured, setDeepseekConfigured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [testingProvider, setTestingProvider] = useState<'gemini' | 'deepseek' | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; latencyMs?: number; message: string } | null>(null);

  // Fetch current AI settings when dialog opens
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get('/api/admin/ai-settings');
      if (res.data?.success) {
        setActiveProvider(res.data.activeProvider || 'gemini');
        setGeminiConfigured(!!res.data.geminiConfigured);
        setDeepseekConfigured(!!res.data.deepseekConfigured);
      }
    } catch (e: any) {
      console.warn('Failed to load AI settings:', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSettings();
      setTestResult(null);
    }
  }, [open]);

  // Handle Switching Provider
  const handleSelectProvider = async (target: 'gemini' | 'deepseek') => {
    if (target === activeProvider) return;

    setIsSwitching(true);
    try {
      const res = await axiosClient.post('/api/admin/ai-settings', { provider: target });
      if (res.data?.success) {
        setActiveProvider(target);
        toast.success(res.data.message || `Switched to ${target === 'deepseek' ? 'DeepSeek AI' : 'Google Gemini'}`);

        // Broadcast to entire app
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('ai-provider-changed', {
              detail: { provider: target, timestamp: Date.now() }
            })
          );
        }

        if (onProviderChanged) {
          onProviderChanged(target);
        }
      } else {
        toast.error(res.data?.message || 'Failed to switch AI provider');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Error switching AI provider');
    } finally {
      setIsSwitching(false);
    }
  };

  // Test live connection to selected AI engine
  const handleTestConnection = async (target: 'gemini' | 'deepseek') => {
    setTestingProvider(target);
    setTestResult(null);
    try {
      const res = await axiosClient.put('/api/admin/ai-settings', { provider: target });
      if (res.data?.success) {
        setTestResult({
          provider: target,
          success: true,
          latencyMs: res.data.latencyMs,
          message: res.data.message
        });
        toast.success(`Ping verified! ${target === 'deepseek' ? 'DeepSeek AI' : 'Google Gemini'} latency: ${res.data.latencyMs}ms`);
      } else {
        setTestResult({
          provider: target,
          success: false,
          message: res.data?.message || 'Connection ping failed.'
        });
        toast.warning(res.data?.message || 'Connection test failed');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Ping failed';
      setTestResult({
        provider: target,
        success: false,
        message: errMsg
      });
      toast.error(errMsg);
    } finally {
      setTestingProvider(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: { xs: 1, sm: 2 },
          bgcolor: isDark ? '#0F172A' : '#FFFFFF',
          backgroundImage: 'none',
          boxShadow: isDark ? '0 24px 64px rgba(0, 0, 0, 0.8)' : '0 24px 64px rgba(0, 0, 0, 0.15)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
        }
      }}
    >
      {/* Title Bar */}
      <DialogTitle sx={{ px: 2, py: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Chip
                icon={<Security sx={{ fontSize: '12px !important' }} />}
                label="ADMINISTRATIVE AI CONTROLS"
                size="small"
                color="primary"
                sx={{ fontWeight: 800, fontSize: '0.65rem', height: 22 }}
              />
              <Chip
                label="HOSPITAL-WIDE ENGINE"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.65rem', height: 22 }}
              />
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
              Select Active Clinical AI Provider
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Configure which state-of-the-art AI model powers all clinical analysis, prescription checking, diet schedules, and copilot chat.
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider sx={{ my: 1 }} />

      <DialogContent sx={{ px: { xs: 1, sm: 2 }, py: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
            <CircularProgress size={40} color="primary" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading current AI engine configuration...
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Engine Selection Cards */}
            <Grid container spacing={2.5}>
              {/* ─── GOOGLE GEMINI CARD ─── */}
              <Grid item xs={12} sm={6}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    position: 'relative',
                    transition: 'all 0.25s ease',
                    bgcolor: activeProvider === 'gemini'
                      ? (isDark ? 'rgba(0, 201, 167, 0.08)' : 'rgba(0, 201, 167, 0.05)')
                      : (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'),
                    borderColor: activeProvider === 'gemini'
                      ? '#00C9A7'
                      : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'),
                    borderWidth: activeProvider === 'gemini' ? 2 : 1,
                    boxShadow: activeProvider === 'gemini'
                      ? '0 8px 24px rgba(0, 201, 167, 0.25)'
                      : 'none',
                    '&:hover': {
                      borderColor: '#00C9A7',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => handleSelectProvider('gemini')}
                    disabled={isSwitching}
                    sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                  >
                    {/* Top Row: Icon + Active Status */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%" mb={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #00C9A7 0%, #008168 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFF',
                          boxShadow: '0 4px 14px rgba(0, 201, 167, 0.4)'
                        }}
                      >
                        <AutoAwesome sx={{ fontSize: 26 }} />
                      </Box>

                      {activeProvider === 'gemini' ? (
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: '14px !important', color: '#FFF !important' }} />}
                          label="ACTIVE ENGINE"
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: '#00C9A7', color: '#FFF' }}
                        />
                      ) : (
                        <Chip
                          label="STANDBY"
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                        />
                      )}
                    </Stack>

                    {/* Model Title */}
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.3 }}>
                      Google Gemini 3.8 Flash
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#00C9A7', fontWeight: 800, mb: 1.5, display: 'block' }}>
                      Multimodal Vision • High-Throughput Clinical AI
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem', lineHeight: 1.5 }}>
                      Engineered for lightning-fast sub-second responses, direct visual PDF prescription scanning, and high-volume clinical intake.
                    </Typography>

                    {/* Key Capabilities */}
                    <Stack spacing={1} width="100%" mb={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Visibility sx={{ fontSize: 16, color: '#00C9A7' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Native Multimodal OCR (Direct image/PDF parsing)
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Speed sx={{ fontSize: 16, color: '#00C9A7' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Sub-second latency (Real-time clinical bedside chats)
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MedicalServices sx={{ fontSize: 16, color: '#00C9A7' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          High-yield bulleted Dr-to-Dr consultations
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Key Status Pill */}
                    <Box sx={{ width: '100%', pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          API Key Status:
                        </Typography>
                        <Chip
                          label={geminiConfigured ? 'Configured' : 'Missing in .env.local'}
                          size="small"
                          color={geminiConfigured ? 'success' : 'warning'}
                          sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                        />
                      </Stack>
                    </Box>
                  </CardActionArea>

                  {/* Test Connection Button */}
                  <Box sx={{ p: 1.5, pt: 0, bgcolor: 'transparent' }}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestConnection('gemini');
                      }}
                      disabled={testingProvider === 'gemini'}
                      startIcon={testingProvider === 'gemini' ? <CircularProgress size={14} /> : <Bolt sx={{ color: '#00C9A7' }} />}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', borderRadius: 1.5 }}
                    >
                      {testingProvider === 'gemini' ? 'Testing Ping...' : 'Test Gemini Connection'}
                    </Button>
                  </Box>
                </Card>
              </Grid>

              {/* ─── DEEPSEEK AI CARD ─── */}
              <Grid item xs={12} sm={6}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    position: 'relative',
                    transition: 'all 0.25s ease',
                    bgcolor: activeProvider === 'deepseek'
                      ? (isDark ? 'rgba(79, 70, 229, 0.08)' : 'rgba(79, 70, 229, 0.05)')
                      : (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'),
                    borderColor: activeProvider === 'deepseek'
                      ? '#4F46E5'
                      : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'),
                    borderWidth: activeProvider === 'deepseek' ? 2 : 1,
                    boxShadow: activeProvider === 'deepseek'
                      ? '0 8px 24px rgba(79, 70, 229, 0.25)'
                      : 'none',
                    '&:hover': {
                      borderColor: '#4F46E5',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => handleSelectProvider('deepseek')}
                    disabled={isSwitching}
                    sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                  >
                    {/* Top Row: Icon + Active Status */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%" mb={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFF',
                          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
                        }}
                      >
                        <Psychology sx={{ fontSize: 28 }} />
                      </Box>

                      {activeProvider === 'deepseek' ? (
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: '14px !important', color: '#FFF !important' }} />}
                          label="ACTIVE ENGINE"
                          size="small"
                          sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: '#4F46E5', color: '#FFF' }}
                        />
                      ) : (
                        <Chip
                          label="STANDBY"
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                        />
                      )}
                    </Stack>

                    {/* Model Title */}
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.3 }}>
                      DeepSeek AI (DeepSeek-V3)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#818CF8', fontWeight: 800, mb: 1.5, display: 'block' }}>
                      Deep Clinical Reasoning • Pharmacological Logic
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem', lineHeight: 1.5 }}>
                      Exceptional pharmacological reasoning, rigorous metabolic cardiorenal titration, multi-drug synergy, and acute renal protection.
                    </Typography>

                    {/* Key Capabilities */}
                    <Stack spacing={1} width="100%" mb={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Hub sx={{ fontSize: 16, color: '#818CF8' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Deep Multi-Drug Pharmacological Reasoning
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Security sx={{ fontSize: 16, color: '#818CF8' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Precision Organ-Adjusted Renal/Hepatic Dosing
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MedicalServices sx={{ fontSize: 16, color: '#818CF8' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Strict ADA/KDIGO evidence-based guidelines
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Key Status Pill */}
                    <Box sx={{ width: '100%', pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          API Key Status:
                        </Typography>
                        <Chip
                          label={deepseekConfigured ? 'Configured' : 'Missing in .env.local'}
                          size="small"
                          color={deepseekConfigured ? 'success' : 'warning'}
                          sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                        />
                      </Stack>
                    </Box>
                  </CardActionArea>

                  {/* Test Connection Button */}
                  <Box sx={{ p: 1.5, pt: 0, bgcolor: 'transparent' }}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestConnection('deepseek');
                      }}
                      disabled={testingProvider === 'deepseek'}
                      startIcon={testingProvider === 'deepseek' ? <CircularProgress size={14} /> : <Bolt sx={{ color: '#818CF8' }} />}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', borderRadius: 1.5 }}
                    >
                      {testingProvider === 'deepseek' ? 'Testing Ping...' : 'Test DeepSeek Connection'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Test Results Banner */}
            {testResult && (
              <Box sx={{ mt: 2.5 }}>
                <Alert
                  severity={testResult.success ? 'success' : 'warning'}
                  sx={{ borderRadius: 1.5, '& .MuiAlert-message': { width: '100%' } }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {testResult.success ? 'Engine Operational' : 'Engine Warning'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                    {testResult.message}
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* ─── MODULE COVERAGE BREAKDOWN ─── */}
            <Box
              sx={{
                mt: 2.5,
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: activeProvider === 'deepseek'
                  ? (isDark ? 'rgba(79, 70, 229, 0.35)' : 'rgba(79, 70, 229, 0.25)')
                  : (isDark ? 'rgba(0, 201, 167, 0.3)' : 'rgba(0, 201, 167, 0.2)'),
                bgcolor: activeProvider === 'deepseek'
                  ? (isDark ? 'rgba(79, 70, 229, 0.06)' : 'rgba(79, 70, 229, 0.03)')
                  : (isDark ? 'rgba(0, 201, 167, 0.05)' : 'rgba(0, 201, 167, 0.03)')
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <Hub sx={{ fontSize: 16, color: activeProvider === 'deepseek' ? '#818CF8' : '#00C9A7' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Module Engine Coverage — What Changes When You Switch
                </Typography>
              </Stack>

              <Stack spacing={0.9}>
                {/* Modules that use the selected provider */}
                {[
                  { label: 'Prescription Safety Analysis (Manual Form)', icon: '💊' },
                  { label: 'Indian Clinical Diet Plan Generation', icon: '🥗' },
                  { label: 'Patient Counselling & 10-Factor Risk Assessment', icon: '📋' },
                  { label: 'AI Copilot Chat (Doctor-to-Doctor)', icon: '🤖' },
                ].map((item) => (
                  <Stack key={item.label} direction="row" alignItems="center" spacing={1}>
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      bgcolor: activeProvider === 'deepseek' ? 'rgba(79,70,229,0.15)' : 'rgba(0,201,167,0.15)',
                      border: '1.5px solid',
                      borderColor: activeProvider === 'deepseek' ? '#818CF8' : '#00C9A7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', color: activeProvider === 'deepseek' ? '#818CF8' : '#00C9A7', fontWeight: 900
                    }}>✓</Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.77rem', flexGrow: 1 }}>
                      {item.icon} {item.label}
                    </Typography>
                    <Chip
                      label={activeProvider === 'deepseek' ? 'DeepSeek-V3' : 'Gemini 3.8 Flash'}
                      size="small"
                      sx={{
                        height: 18, fontSize: '0.6rem', fontWeight: 800, flexShrink: 0,
                        bgcolor: activeProvider === 'deepseek' ? 'rgba(79,70,229,0.14)' : 'rgba(0,201,167,0.12)',
                        color: activeProvider === 'deepseek' ? '#818CF8' : '#00C9A7',
                        border: '1px solid', borderColor: activeProvider === 'deepseek' ? 'rgba(79,70,229,0.45)' : 'rgba(0,201,167,0.45)'
                      }}
                    />
                  </Stack>
                ))}

                {/* Divider */}
                <Box sx={{ borderTop: '1px dashed', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', my: 0.5 }} />

                {/* Modules always on Gemini (vision/OCR - non-switchable) */}
                {[
                  { label: 'Prescription Image / PDF Scan (OCR Reading)', icon: '📷' },
                  { label: 'Diet Plan from Prescription Image Scan', icon: '🖼️' },
                ].map((item) => (
                  <Stack key={item.label} direction="row" alignItems="center" spacing={1}>
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      bgcolor: 'rgba(0,201,167,0.12)', border: '1.5px solid #00C9A7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', color: '#00C9A7', fontWeight: 900
                    }}>✓</Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.77rem', flexGrow: 1, color: 'text.secondary' }}>
                      {item.icon} {item.label}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                      <Chip
                        label="Always Gemini Vision"
                        size="small"
                        sx={{
                          height: 18, fontSize: '0.6rem', fontWeight: 800,
                          bgcolor: 'rgba(0,201,167,0.12)', color: '#00C9A7',
                          border: '1px solid rgba(0,201,167,0.4)'
                        }}
                      />
                      <Chip
                        label="Not Switchable"
                        size="small"
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, opacity: 0.65 }}
                      />
                    </Stack>
                  </Stack>
                ))}
              </Stack>

              <Box sx={{ mt: 1.5, p: 1.2, borderRadius: 1.5, bgcolor: isDark ? 'rgba(255,193,7,0.08)' : 'rgba(255,193,7,0.07)', border: '1px solid rgba(255,193,7,0.25)' }}>
                <Typography variant="caption" sx={{ color: isDark ? '#FCD34D' : '#92690b', lineHeight: 1.5, display: 'block' }}>
                  ⚠️ <strong>Why image scanning always uses Gemini:</strong> DeepSeek is a text-only model and cannot read images or PDFs. Gemini Vision handles all OCR document reading. The AI provider switch only affects text-based clinical reasoning modules.
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <Divider sx={{ my: 1 }} />

      <DialogActions sx={{ px: 2, py: 1.5, justifyContent: 'space-between' }}>
        <Button
          size="small"
          color="inherit"
          onClick={fetchSettings}
          startIcon={<Refresh />}
          disabled={isLoading || isSwitching}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Refresh Status
        </Button>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            sx={{ fontWeight: 700, borderRadius: 1 }}
          >
            Close
          </Button>

          <Button
            variant="contained"
            color={activeProvider === 'deepseek' ? 'secondary' : 'primary'}
            onClick={() => handleSelectProvider(activeProvider === 'gemini' ? 'deepseek' : 'gemini')}
            disabled={isSwitching}
            startIcon={isSwitching ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />}
            sx={{ fontWeight: 800, borderRadius: 1 }}
          >
            {isSwitching
              ? 'Switching Engine...'
              : `Switch to ${activeProvider === 'gemini' ? 'DeepSeek AI' : 'Google Gemini'}`}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
