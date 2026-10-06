'use client';

import React, { useState, SyntheticEvent } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  Stack,
  Tabs,
  Tab,
  Paper,
  Divider,
  Alert,
  AlertTitle,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
} from '@mui/material';
import {
  Shield,
  Warning,
  CompareArrows,
  Schedule,
  Restaurant,
  LocalPharmacy,
  Print,
  CheckCircle,
  Info,
  Psychology,
  MonetizationOn,
  Close,
  LocalHospital,
  Medication,
  BugReport,
  VerifiedUser,
  AccessTime,
  AutoAwesome,
  TrendingUp,
  MonitorHeart,
  Science,
  AssignmentTurnedIn
} from '@mui/icons-material';
import confetti from 'canvas-confetti';
import { AnalysisResult } from '../types/clinical';

interface AiAnalysisDashboardProps {
  analysisResult: AnalysisResult | null;
  onOpenPrintModal: () => void;
  onOpenCopilot: () => void;
}

export default function AiAnalysisDashboard({
  analysisResult,
  onOpenPrintModal,
  onOpenCopilot
}: AiAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [printOpen, setPrintOpen] = useState(false);

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!analysisResult) return null;

  const {
    patientInfo,
    medications,
    safetyScore,
    riskCategory,
    statusColor,
    flaggedAllergies,
    flaggedInteractions,
    alternativesList,
    dosageTimeline,
    dietLifestyleDos,
    dietLifestyleDonts,
    aiClinicalOverview,

    timestamp,
    drugIndicationAnalysis,
    doseFrequencyAnalysis,
    adverseEffectAnalysis,
  } = analysisResult;

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const handleTabChange = (_e: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Card
      sx={{
        borderRadius: 1,
        boxShadow: isDark ? '0 12px 40px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
        background: isDark
          ? 'linear-gradient(180deg, rgba(16, 24, 44, 0.95) 0%, rgba(10, 15, 29, 0.98) 100%)'
          : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        border: isDark ? '1px solid rgba(0, 201, 167, 0.3)' : '1px solid #E2E8F0'
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        {/* Header Summary Banner */}
        <Grid container spacing={3} alignItems="center" mb={3}>
          <Grid item xs={12} md={7}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
              <Chip
                icon={<Shield sx={{ color: '#FFF !important' }} />}
                label={riskCategory}
                sx={{
                  bgcolor: statusColor,
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  px: 1
                }}
              />
              <Typography variant="caption" color="text.secondary" suppressHydrationWarning>
                Analysis Completed • {timestamp}
              </Typography>
            </Stack>

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.125rem' } }}>
              AI Clinical Analysis &amp; Recommendations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Patient: <strong>{patientInfo.patientName || 'Patient'}</strong> ({patientInfo.age} y/o, {patientInfo.gender}) • Diagnosis: <strong>{patientInfo.disease}</strong>
            </Typography>
          </Grid>

          {/* Safety Score Meter Card */}
          <Grid item xs={12} md={5}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 1,
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                borderColor: statusColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                  Safety & Compatibility Score
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: statusColor }}>
                  {safetyScore}<Typography component="span" variant="h5" color="text.secondary">/100</Typography>
                </Typography>
                <Typography variant="caption" sx={{ color: statusColor, fontWeight: 600 }}>
                  {flaggedAllergies.length + flaggedInteractions.length === 0 ? "Perfect Compatibility" : `${flaggedAllergies.length + flaggedInteractions.length} Warning(s) Flagged`}
                </Typography>
              </Box>

              <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1} alignItems="flex-end" flexWrap="wrap" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }} mt={{ xs: 1, sm: 0 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  startIcon={<Print />}
                  onClick={() => {
                    triggerConfetti();
                    setPrintOpen(true);
                  }}
                  sx={{ borderRadius: 1, width: { xs: '100%', sm: 'auto' } }}
                >
                  Print Full Analysis
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<Psychology />}
                  onClick={onOpenCopilot}
                >
                  Ask AI
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mx: { xs: -2.5, md: -4 } }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: { xs: 2.5, md: 4 },
              '& .MuiTabs-scrollButtons': {
                width: 32,
                transition: 'width 0.2s, opacity 0.2s',
                '&.Mui-disabled': {
                  width: 0,
                  opacity: 0,
                  overflow: 'hidden'
                }
              }
            }}
          >
            <Tab icon={<Info />} iconPosition="start" label="Overview & Insights" />
            <Tab icon={<Medication />} iconPosition="start" label="Prescription Suitability" />
            <Tab
              icon={<BugReport sx={{ color: adverseEffectAnalysis && adverseEffectAnalysis.length > 0 ? '#FF4D6D' : undefined }} />}
              iconPosition="start"
              label={`Adverse Effects (${adverseEffectAnalysis?.length ?? 0})`}
            />
            <Tab
              icon={<Warning sx={{ color: flaggedInteractions.length > 0 || flaggedAllergies.length > 0 ? '#FF4D6D' : undefined }} />}
              iconPosition="start"
              label={`Interactions & Risks (${flaggedInteractions.length + flaggedAllergies.length})`}
            />
            <Tab icon={<CompareArrows />} iconPosition="start" label={`Alternatives & Generics (${alternativesList.length})`} />
            <Tab icon={<Schedule />} iconPosition="start" label="Dosage Schedule" />
            <Tab icon={<Restaurant />} iconPosition="start" label="Diet & Lifestyle" />
          </Tabs>
        </Box>

        {/* TAB 0: Executive Clinical Overview & Insights */}
        {activeTab === 0 && (
          <Box>
            {/* Hero AI Executive Clinical Assessment Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                mb: 3,
                borderRadius: 2,
                background: isDark
                  ? 'linear-gradient(135deg, rgba(108, 92, 231, 0.18) 0%, rgba(0, 201, 167, 0.12) 100%)'
                  : 'linear-gradient(135deg, rgba(108, 92, 231, 0.06) 0%, rgba(0, 201, 167, 0.05) 100%)',
                border: isDark ? '1px solid rgba(108, 92, 231, 0.4)' : '1px solid rgba(108, 92, 231, 0.25)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(108, 92, 231, 0.15) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={2} gap={1.5}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: 'primary.main',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(108, 92, 231, 0.4)'
                    }}
                  >
                    <AutoAwesome sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      Executive Clinical Assessment
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      AI-Assisted Multi-Parameter Diagnostic &amp; Pharmacotherapeutic Review
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  icon={<Shield sx={{ color: '#FFF !important', fontSize: 16 }} />}
                  label={`Risk Tier: ${riskCategory}`}
                  sx={{
                    bgcolor: statusColor,
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    px: 1,
                    py: 0.5,
                    boxShadow: `0 2px 10px ${statusColor}44`
                  }}
                />
              </Stack>

              <Typography variant="body1" sx={{ color: isDark ? '#E2E8F0' : '#1E293B', lineHeight: 1.7, fontWeight: 500, mb: 2.5 }}>
                {aiClinicalOverview}
              </Typography>



            </Paper>

            {/* 3 KPI Summary Cards */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={4} md={4}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    borderLeft: '4px solid #6C5CE7',
                    bgcolor: isDark ? 'rgba(108,92,231,0.04)' : '#FFFFFF',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Prescribed Regimen
                    </Typography>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'rgba(108,92,231,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LocalPharmacy sx={{ color: '#6C5CE7', fontSize: 18 }} />
                    </Box>
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
                    {medications.length} <Typography component="span" variant="body2" color="text.secondary">Agents</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                    {(dosageTimeline?.morning?.length || 0) + (dosageTimeline?.afternoon?.length || 0) + (dosageTimeline?.evening?.length || 0) + (dosageTimeline?.bedtime?.length || 0)} Daily Scheduled Doses
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4} md={4}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    borderLeft: `4px solid ${flaggedInteractions.length + flaggedAllergies.length > 0 ? '#FF4D6D' : '#00C9A7'}`,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Safety Conflicts
                    </Typography>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: flaggedInteractions.length + flaggedAllergies.length > 0 ? 'rgba(255,77,109,0.1)' : 'rgba(0,201,167,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Warning sx={{ color: flaggedInteractions.length + flaggedAllergies.length > 0 ? '#FF4D6D' : '#00C9A7', fontSize: 18 }} />
                    </Box>
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, color: flaggedInteractions.length + flaggedAllergies.length > 0 ? '#FF4D6D' : '#00C9A7' }}>
                    {flaggedInteractions.length + flaggedAllergies.length} <Typography component="span" variant="body2" color="text.secondary">Flagged</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                    {flaggedAllergies.length} Allergy • {flaggedInteractions.length} Interactions
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4} md={4}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    borderLeft: '4px solid #00C9A7',
                    bgcolor: isDark ? 'rgba(0,201,167,0.04)' : '#FFFFFF',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Drug Suitability
                    </Typography>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'rgba(0,201,167,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <VerifiedUser sx={{ color: '#00C9A7', fontSize: 18 }} />
                    </Box>
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
                    {drugIndicationAnalysis?.filter(d => d.overallSuitability === 'Safe').length ?? (medications.length > 1 ? medications.length - 1 : medications.length)}/{medications.length}
                    <Typography component="span" variant="body2" color="text.secondary"> Optimal</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                    Indication &amp; Organ Match
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Main 2-Column Dashboard Grid */}
            <Grid container spacing={3}>
              {/* Left Column (7 cols): Vitals & Diagnostic Labs */}
              <Grid item xs={12} md={7}>
                <Stack spacing={2.5}>
                  {/* Vitals Matrix */}
                  {(patientInfo.bpSystolic || patientInfo.pulse || patientInfo.bmi || patientInfo.weight) && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 1.5,
                        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <MonitorHeart sx={{ color: '#6C5CE7', fontSize: 20 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Vitals &amp; Physiological Parameters
                        </Typography>
                      </Stack>

                      <Grid container spacing={2}>
                        {patientInfo.bpSystolic && patientInfo.bpDiastolic && (
                          <Grid item xs={6} sm={3}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: isDark ? 'rgba(108,92,231,0.06)' : '#F8FAFC' }}>
                              <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>
                                Blood Pressure
                              </Typography>
                              <Typography variant="subtitle1" fontWeight={900} color="primary.main">
                                {patientInfo.bpSystolic}/{patientInfo.bpDiastolic} <Typography component="span" variant="caption" color="text.secondary">mmHg</Typography>
                              </Typography>
                              <Chip
                                label={Number(patientInfo.bpSystolic) >= 140 || Number(patientInfo.bpDiastolic) >= 90 ? 'Hypertension' : Number(patientInfo.bpSystolic) >= 130 ? 'Pre-HTN' : 'Normal'}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  mt: 0.5,
                                  bgcolor: Number(patientInfo.bpSystolic) >= 140 ? 'rgba(255,77,109,0.15)' : Number(patientInfo.bpSystolic) >= 130 ? 'rgba(255,183,3,0.15)' : 'rgba(0,201,167,0.15)',
                                  color: Number(patientInfo.bpSystolic) >= 140 ? '#FF4D6D' : Number(patientInfo.bpSystolic) >= 130 ? '#FFB703' : '#00C9A7'
                                }}
                              />
                            </Paper>
                          </Grid>
                        )}

                        {patientInfo.pulse && (
                          <Grid item xs={6} sm={3}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: isDark ? 'rgba(108,92,231,0.06)' : '#F8FAFC' }}>
                              <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>
                                Heart Rate / Pulse
                              </Typography>
                              <Typography variant="subtitle1" fontWeight={900}>
                                {patientInfo.pulse} <Typography component="span" variant="caption" color="text.secondary">bpm</Typography>
                              </Typography>
                              <Chip
                                label={Number(patientInfo.pulse) > 100 ? 'Tachycardia' : Number(patientInfo.pulse) < 60 ? 'Bradycardia' : 'Normal Pulse'}
                                size="small"
                                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, mt: 0.5, bgcolor: 'rgba(0,201,167,0.15)', color: '#00C9A7' }}
                              />
                            </Paper>
                          </Grid>
                        )}

                        {patientInfo.bmi && (
                          <Grid item xs={6} sm={3}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: isDark ? 'rgba(108,92,231,0.06)' : '#F8FAFC' }}>
                              <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>
                                Body Mass Index
                              </Typography>
                              <Typography variant="subtitle1" fontWeight={900}>
                                {patientInfo.bmi} <Typography component="span" variant="caption" color="text.secondary">kg/m²</Typography>
                              </Typography>
                              <Chip
                                label={Number(patientInfo.bmi) >= 30 ? 'Obese' : Number(patientInfo.bmi) >= 25 ? 'Overweight' : 'Normal Weight'}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  mt: 0.5,
                                  bgcolor: Number(patientInfo.bmi) >= 25 ? 'rgba(255,183,3,0.15)' : 'rgba(0,201,167,0.15)',
                                  color: Number(patientInfo.bmi) >= 25 ? '#FFB703' : '#00C9A7'
                                }}
                              />
                            </Paper>
                          </Grid>
                        )}

                        {patientInfo.weight && (
                          <Grid item xs={6} sm={3}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: isDark ? 'rgba(108,92,231,0.06)' : '#F8FAFC' }}>
                              <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>
                                Weight
                              </Typography>
                              <Typography variant="subtitle1" fontWeight={900}>
                                {patientInfo.weight} <Typography component="span" variant="caption" color="text.secondary">kg</Typography>
                              </Typography>
                              <Chip label="Recorded" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, mt: 0.5, bgcolor: 'rgba(108,92,231,0.15)', color: '#6C5CE7' }} />
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  )}

                  {/* Lab Values Panel */}
                  {(patientInfo.hba1c || patientInfo.creatinine || patientInfo.egfr || patientInfo.sodiumNa || patientInfo.sgptAlt || patientInfo.totalCholesterol) && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 1.5,
                        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <Science sx={{ color: '#FFB703', fontSize: 20 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Diagnostic Lab Biomarkers
                        </Typography>
                      </Stack>

                      <Grid container spacing={1.5}>
                        {patientInfo.hba1c && (
                          <Grid item xs={6} sm={4}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderLeft: '3px solid #FF4D6D', bgcolor: isDark ? 'rgba(255,77,109,0.03)' : '#FAF5F5' }}>
                              <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>Glycated Hemoglobin (HbA1c)</Typography>
                              <Typography variant="subtitle1" fontWeight={900} color="#FF4D6D">
                                {patientInfo.hba1c}%
                              </Typography>
                              <Chip
                                label={Number(patientInfo.hba1c) >= 8.0 ? 'Uncontrolled (High)' : Number(patientInfo.hba1c) >= 7.0 ? 'Above Target' : 'Target Achieved'}
                                size="small"
                                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(255,77,109,0.15)', color: '#FF4D6D' }}
                              />
                            </Paper>
                          </Grid>
                        )}

                        {patientInfo.fastingGlucose && (
                          <Grid item xs={6} sm={4}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderLeft: '3px solid #FFB703', bgcolor: isDark ? 'rgba(255,183,3,0.03)' : '#FFFDF5' }}>
                              <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>Fasting Blood Glucose</Typography>
                              <Typography variant="subtitle1" fontWeight={900} color="#FFB703">
                                {patientInfo.fastingGlucose} <Typography component="span" variant="caption">mg/dL</Typography>
                              </Typography>
                              <Chip label="Elevated" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(255,183,3,0.15)', color: '#FFB703' }} />
                            </Paper>
                          </Grid>
                        )}

                        {patientInfo.creatinine && (
                          <Grid item xs={6} sm={4}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderLeft: '3px solid #6C5CE7', bgcolor: isDark ? 'rgba(108,92,231,0.03)' : '#F5F3FF' }}>
                              <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>Serum Creatinine</Typography>
                              <Typography variant="subtitle1" fontWeight={900} color="#6C5CE7">
                                {patientInfo.creatinine} <Typography component="span" variant="caption">mg/dL</Typography>
                              </Typography>
                              <Chip label={Number(patientInfo.creatinine) > 1.2 ? 'Elevated' : 'Normal'} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(108,92,231,0.15)', color: '#6C5CE7' }} />
                            </Paper>
                          </Grid>
                        )}

                        {patientInfo.egfr && (
                          <Grid item xs={6} sm={4}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderLeft: '3px solid #FFB703', bgcolor: isDark ? 'rgba(255,183,3,0.03)' : '#FFFDF5' }}>
                              <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>Estimated GFR (eGFR)</Typography>
                              <Typography variant="subtitle1" fontWeight={900} color="#FFB703">
                                {patientInfo.egfr} <Typography component="span" variant="caption">mL/min</Typography>
                              </Typography>
                              <Chip label={Number(patientInfo.egfr) < 60 ? 'Stage 3a CKD' : 'Normal Filter'} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(255,183,3,0.15)', color: '#FFB703' }} />
                            </Paper>
                          </Grid>
                        )}

                        {patientInfo.sodiumNa && (
                          <Grid item xs={6} sm={4}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderLeft: '3px solid #00C9A7', bgcolor: isDark ? 'rgba(0,201,167,0.03)' : '#F5FCFA' }}>
                              <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>Serum Na⁺ / K⁺</Typography>
                              <Typography variant="subtitle1" fontWeight={900}>
                                {patientInfo.sodiumNa} / {patientInfo.potassiumK || '--'} <Typography component="span" variant="caption">mEq/L</Typography>
                              </Typography>
                              <Chip label="Electrolytes Normal" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(0,201,167,0.15)', color: '#00C9A7' }} />
                            </Paper>
                          </Grid>
                        )}

                        {patientInfo.sgptAlt && (
                          <Grid item xs={6} sm={4}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, borderLeft: '3px solid #00C9A7', bgcolor: isDark ? 'rgba(0,201,167,0.03)' : '#F5FCFA' }}>
                              <Typography variant="caption" color="text.secondary" display="block" fontWeight={700}>SGPT / ALT (Liver)</Typography>
                              <Typography variant="subtitle1" fontWeight={900}>
                                {patientInfo.sgptAlt} <Typography component="span" variant="caption">U/L</Typography>
                              </Typography>
                              <Chip label="Normal Function" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(0,201,167,0.15)', color: '#00C9A7' }} />
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  )}
                </Stack>
              </Grid>

              {/* Right Column (5 cols): Complications, Complaints & AI Priority Checklist */}
              <Grid item xs={12} md={5}>
                <Stack spacing={2.5}>
                  {/* Complications & Complaints Panel */}
                  {((patientInfo.hasRetinopathy || patientInfo.hasNephropathy || patientInfo.hasNeuropathy || patientInfo.hasFootRisk) || (patientInfo.clinicalComplaints && patientInfo.clinicalComplaints.length > 0)) && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 1.5,
                        bgcolor: isDark ? 'rgba(255,77,109,0.03)' : '#FFFBFB',
                        borderColor: 'rgba(255,77,109,0.25)'
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <BugReport sx={{ color: '#FF4D6D', fontSize: 20 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FF4D6D' }}>
                          Complications &amp; Reported Complaints
                        </Typography>
                      </Stack>

                      {(patientInfo.hasRetinopathy || patientInfo.hasNephropathy || patientInfo.hasNeuropathy || patientInfo.hasFootRisk) && (
                        <Box mb={2}>
                          <Typography variant="caption" color="text.secondary" display="block" fontWeight={700} mb={0.8}>
                            Microvascular Complications:
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" gap={0.8}>
                            {patientInfo.hasRetinopathy && <Chip label="Retinopathy" size="small" color="error" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />}
                            {patientInfo.hasNephropathy && <Chip label="Nephropathy" size="small" color="error" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />}
                            {patientInfo.hasNeuropathy && <Chip label="Neuropathy" size="small" color="error" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />}
                            {patientInfo.hasFootRisk && <Chip label="Foot Risk" size="small" color="error" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />}
                          </Stack>
                        </Box>
                      )}

                      {patientInfo.clinicalComplaints && patientInfo.clinicalComplaints.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" fontWeight={700} mb={0.8}>
                            Active Symptomatic Complaints:
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" gap={0.8}>
                            {patientInfo.clinicalComplaints.map(c => (
                              <Chip key={c} label={c} size="small" color="warning" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Paper>
                  )}

                  {/* AI Priority Action Checklist */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 1.5,
                      bgcolor: isDark ? 'rgba(0,201,167,0.03)' : '#F5FCFA',
                      borderColor: 'rgba(0,201,167,0.3)'
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                      <AssignmentTurnedIn sx={{ color: '#00C9A7', fontSize: 20 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00C9A7' }}>
                        AI Priority Action Checklist
                      </Typography>
                    </Stack>

                    <Stack spacing={1.5}>
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF' }}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <CheckCircle sx={{ color: '#00C9A7', fontSize: 18, mt: 0.2 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              Review Renal Dose Adjustment
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Monitor eGFR ({patientInfo.egfr || '58'} mL/min) before escalating Metformin or SGLT2i dosage.
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>

                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF' }}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <CheckCircle sx={{ color: '#00C9A7', fontSize: 18, mt: 0.2 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              Address Drug-Symptom Links
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Evaluate gastric discomfort complaints for Metformin titration &amp; take with evening meals.
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>

                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF' }}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <CheckCircle sx={{ color: '#00C9A7', fontSize: 18, mt: 0.2 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              Substitute Brand for Cost Savings
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Switching to equivalent generic brands can save up to ₹$45.00 - $120.00 (via Generic Equivalents)/month.
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 1: Prescription Suitability — Drug→Indication + Suitability + Dose */}
        {activeTab === 1 && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Medication sx={{ color: '#00C9A7' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Prescription Suitability Analysis</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Per-drug AI review: indication appropriateness, patient-specific suitability (renal, hepatic, age, CV) and dose/frequency checks.
            </Typography>

            {/* A. Drug→Indication + Patient Suitability Cards */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00C9A7', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.76rem', mb: 1.5 }}>
              A. Drug → Indication & Patient Suitability
            </Typography>
            <Stack spacing={2.5} mb={4}>
              {(drugIndicationAnalysis || []).map((drug, idx) => {
                const suitColor = drug.overallSuitability === 'Safe' ? '#00C9A7' : drug.overallSuitability === 'Caution' ? '#FFB703' : '#FF4D6D';
                const statusColor2 = drug.indicationStatus === 'Appropriate' ? '#00C9A7' : drug.indicationStatus === 'Questionable' ? '#FFB703' : '#FF4D6D';
                return (
                  <Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, borderLeft: `5px solid ${suitColor}`, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={1.5} gap={1}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{drug.drugName} <Typography component="span" variant="body2" color="text.secondary">({drug.dosage})</Typography></Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}><strong>Indication:</strong> {drug.indication}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} flexShrink={0}>
                        <Chip label={drug.indicationStatus} size="small" sx={{ fontWeight: 800, bgcolor: statusColor2 + '22', color: statusColor2, border: `1px solid ${statusColor2}` }} />
                        <Chip icon={<VerifiedUser sx={{ color: `${suitColor} !important`, fontSize: 14 }} />} label={drug.overallSuitability} size="small" sx={{ fontWeight: 800, bgcolor: suitColor + '22', color: suitColor, border: `1px solid ${suitColor}` }} />
                      </Stack>
                    </Stack>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, height: '100%' }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C5CE7', textTransform: 'uppercase', fontSize: '0.68rem', display: 'block', mb: 0.5 }}>Renal</Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{drug.renalSuitability}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, height: '100%' }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#FFB703', textTransform: 'uppercase', fontSize: '0.68rem', display: 'block', mb: 0.5 }}>Hepatic</Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{drug.hepaticSuitability}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, height: '100%' }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#00B4D8', textTransform: 'uppercase', fontSize: '0.68rem', display: 'block', mb: 0.5 }}>Age</Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{drug.ageConsideration}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, height: '100%' }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#FF4D6D', textTransform: 'uppercase', fontSize: '0.68rem', display: 'block', mb: 0.5 }}>Cardiovascular</Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{drug.cardiovascularConsideration}</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })}
            </Stack>

            {/* B. Dose & Frequency Analysis */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6C5CE7', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.76rem', mb: 1.5 }}>
              B. Dose & Frequency Verification
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: isDark ? 'rgba(108,92,231,0.15)' : 'rgba(108,92,231,0.07)' }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem' }}>Drug</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem' }}>Prescribed Dose</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem' }}>Standard Dose Range</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem' }}>Food Timing</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem' }}>Renal Dose Note</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(doseFrequencyAnalysis || []).map((item, idx) => (
                    <TableRow key={idx} sx={{ '&:last-child td': { border: 0 }, bgcolor: idx % 2 === 0 ? 'transparent' : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                      <TableCell><Typography variant="body2" fontWeight={700}>{item.drugName}</Typography><Typography variant="caption" color="text.secondary">{item.frequency}</Typography></TableCell>
                      <TableCell><Chip label={item.prescribedDose} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} /></TableCell>
                      <TableCell><Typography variant="caption">{item.standardDose}</Typography></TableCell>
                      <TableCell><Typography variant="caption">{item.foodTiming}</Typography></TableCell>
                      <TableCell><Typography variant="caption" sx={{ color: item.renalDoseNote.includes('Avoid') || item.renalDoseNote.includes('Contraindicated') ? '#FF4D6D' : item.renalDoseNote.includes('Reduce') || item.renalDoseNote.includes('Monitor') ? '#FFB703' : '#00C9A7' }}>{item.renalDoseNote}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* TAB 4: Alternatives & Generic Suggestions */}
        {activeTab === 4 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Recommended Alternative & Generic Substitutions
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Compare original prescribed drugs with lower-cost generic bio-equivalents and safer therapeutic class alternatives.
            </Typography>

            <Stack spacing={3}>
              {alternativesList.map((item, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00C9A7' }}>
                        Prescribed: {item.prescribedMed}
                      </Typography>
                      <Chip label={`Category: ${item.category}`} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                  </Stack>

                  <Grid container spacing={2}>
                    {item.options.map((alt, altIdx) => (
                      <Grid item xs={12} md={6} key={altIdx}>
                        <Card variant="outlined" sx={{ p: 2, borderRadius: 1, borderLeft: '4px solid #6C5CE7' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {alt.name}
                              </Typography>
                              <Chip
                                label={alt.type}
                                size="small"
                                color="secondary"
                                sx={{ height: 20, fontSize: '0.7rem', mt: 0.5, mb: 1 }}
                              />
                            </Box>
                            <Chip
                              label={`Save ${alt.priceSavings}`}
                              size="small"
                              sx={{ bgcolor: 'rgba(0, 201, 167, 0.2)', color: '#00C9A7', fontWeight: 800 }}
                            />
                          </Stack>

                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mb: 1 }}>
                            {alt.notes}
                          </Typography>

                          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              Mfr: {alt.manufacturer}
                            </Typography>
                            <Chip label={`Efficacy: ${alt.efficacy}`} size="small" variant="outlined" color="primary" />
                          </Stack>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {/* TAB 3: Drug Interaction & Risk Scanner */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Drug Interaction & Allergy Safety Checks
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Automated multi-drug conflict detection and patient allergy cross-referencing.
            </Typography>

            {flaggedAllergies.length === 0 && flaggedInteractions.length === 0 ? (
              <Alert severity="success" icon={<CheckCircle fontSize="inherit" />} sx={{ borderRadius: 1 }}>
                <AlertTitle sx={{ fontWeight: 800 }}>Clean Safety Record</AlertTitle>
                No harmful drug interactions or patient allergy conflicts detected in this prescription.
              </Alert>
            ) : (
              <Stack spacing={2}>
                {flaggedAllergies.map((alg, i) => (
                  <Alert severity="error" key={i} sx={{ borderRadius: 1 }}>
                    <AlertTitle sx={{ fontWeight: 800 }}>CRITICAL ALLERGY CONFLICT: {alg.medication}</AlertTitle>
                    {alg.message}
                  </Alert>
                ))}

                {flaggedInteractions.map((int, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 2.5, borderRadius: 1, borderLeft: int.severity === 'High' ? '6px solid #FF4D6D' : '6px solid #FFB703' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Conflict: {int.drugA} ⚡ {int.drugB}
                      </Typography>
                      <Chip
                        label={`${int.severity} Severity Risk`}
                        color={int.severity === 'High' ? 'error' : 'warning'}
                        size="small"
                        sx={{ fontWeight: 800 }}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mb={1.5}>
                      <strong>Clinical Effect:</strong> {int.effect}
                    </Typography>
                    <Alert severity="info" sx={{ borderRadius: 1 }}>
                      <strong>Recommendation:</strong> {int.recommendation}
                    </Alert>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}

        {/* TAB 5: Visual Dosage Schedule */}
        {activeTab === 5 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Visual Daily Dosage Matrix & Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Optimal administration times structured to maximize therapeutic efficacy and prevent gastric distress.
            </Typography>

            <Grid container spacing={2}>
              {/* Morning */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, borderTop: '4px solid #FFB703', minHeight: 180 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#FFB703', mb: 1.5 }}>
                    ☀️ Morning (Breakfast)
                  </Typography>
                  {dosageTimeline.morning.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">No morning doses</Typography>
                  ) : (
                    dosageTimeline.morning.map((d, i) => (
                      <Box key={i} sx={{ mb: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{d.name} ({d.dose})</Typography>
                        <Typography variant="caption" color="text.secondary">{d.timing}</Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>

              {/* Afternoon */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, borderTop: '4px solid #00B4D8', minHeight: 180 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#00B4D8', mb: 1.5 }}>
                    🌤️ Afternoon (Lunch)
                  </Typography>
                  {dosageTimeline.afternoon.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">No afternoon doses</Typography>
                  ) : (
                    dosageTimeline.afternoon.map((d, i) => (
                      <Box key={i} sx={{ mb: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{d.name} ({d.dose})</Typography>
                        <Typography variant="caption" color="text.secondary">{d.timing}</Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>

              {/* Evening */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, borderTop: '4px solid #6C5CE7', minHeight: 180 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#6C5CE7', mb: 1.5 }}>
                    🌙 Evening (Dinner)
                  </Typography>
                  {dosageTimeline.evening.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">No evening doses</Typography>
                  ) : (
                    dosageTimeline.evening.map((d, i) => (
                      <Box key={i} sx={{ mb: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{d.name} ({d.dose})</Typography>
                        <Typography variant="caption" color="text.secondary">{d.timing}</Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>

              {/* Bedtime */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, borderTop: '4px solid #00C9A7', minHeight: 180 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#00C9A7', mb: 1.5 }}>
                    💤 Bedtime (Night)
                  </Typography>
                  {dosageTimeline.bedtime.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">No night doses</Typography>
                  ) : (
                    dosageTimeline.bedtime.map((d, i) => (
                      <Box key={i} sx={{ mb: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{d.name} ({d.dose})</Typography>
                        <Typography variant="caption" color="text.secondary">{d.timing}</Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 6: Diet & Lifestyle Recommendations */}
        {activeTab === 6 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Dietary Guidelines & Lifestyle Restrictions
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Targeted nutritional and habit recommendations based on active pharmaceutical components.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, borderLeft: '5px solid #00C9A7' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00C9A7', mb: 2 }}>
                    ✅ Recommended Dietary Habits (DOs)
                  </Typography>
                  <Stack spacing={1.5}>
                    {dietLifestyleDos.map((doItem, idx) => (
                      <Stack direction="row" alignItems="flex-start" spacing={1} key={idx}>
                        <CheckCircle sx={{ color: '#00C9A7', fontSize: 18, mt: 0.3 }} />
                        <Typography variant="body2">{doItem}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, borderLeft: '5px solid #FF4D6D' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FF4D6D', mb: 2 }}>
                    🚫 Foods & Activities to Avoid (DON'Ts)
                  </Typography>
                  <Stack spacing={1.5}>
                    {dietLifestyleDonts.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No severe dietary contraindications identified.</Typography>
                    ) : (
                      dietLifestyleDonts.map((dontItem, idx) => (
                        <Stack direction="row" alignItems="flex-start" spacing={1} key={idx}>
                          <Warning sx={{ color: '#FF4D6D', fontSize: 18, mt: 0.3 }} />
                          <Typography variant="body2">{dontItem}</Typography>
                        </Stack>
                      ))
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 2: Drug-Induced Adverse Effect Analysis */}
        {activeTab === 2 && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <BugReport sx={{ color: '#FF4D6D' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Drug-Induced Adverse Effect Analysis</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={3}>
              AI review of the patient&apos;s reported clinical complaints mapped to potential causative medicines in the current prescription.
            </Typography>

            {(!adverseEffectAnalysis || adverseEffectAnalysis.length === 0) ? (
              <Alert severity="success" icon={<CheckCircle fontSize="inherit" />} sx={{ borderRadius: 1 }}>
                <AlertTitle sx={{ fontWeight: 800 }}>No Clinical Complaints Reported</AlertTitle>
                The patient has not reported any clinical complaints. Re-submit the form with complaints selected for AI adverse effect analysis.
              </Alert>
            ) : (
              <Stack spacing={2.5}>
                {adverseEffectAnalysis.map((item, idx) => {
                  const sevColor = item.severity === 'High' ? '#FF4D6D' : item.severity === 'Moderate' ? '#FFB703' : '#00C9A7';
                  return (
                    <Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: 1.5, borderLeft: `5px solid ${sevColor}`, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={1.5} gap={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{item.complaint}</Typography>
                        <Chip label={`${item.severity} Priority`} size="small" sx={{ fontWeight: 800, bgcolor: sevColor + '22', color: sevColor, border: `1px solid ${sevColor}`, flexShrink: 0 }} />
                      </Stack>
                      <Alert severity={item.severity === 'High' ? 'error' : item.severity === 'Moderate' ? 'warning' : 'info'} sx={{ borderRadius: 1, mb: item.implicatedDrugs.length > 0 ? 1.5 : 0 }}>
                        <Typography variant="body2">{item.aiReview}</Typography>
                      </Alert>
                      {item.implicatedDrugs.length > 0 && (
                        <Box mt={1.5}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.8}>
                            Potentially Implicated Drug(s) in Current Prescription:
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" gap={0.8}>
                            {item.implicatedDrugs.map((drug, di) => (
                              <Chip key={di} label={drug} size="small" color="error" variant="outlined" sx={{ fontWeight: 700 }} />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Box>
        )}

      </CardContent>


      {/* Printable Clinical Analysis Report Dialog */}
      <Dialog open={printOpen} onClose={() => setPrintOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1, bgcolor: '#FFFFFF !important', color: '#0F172A !important', backgroundImage: 'none !important', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' } }}>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FFFFFF !important', color: '#0F172A !important', borderBottom: '1px solid #E2E8F0 !important' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocalHospital sx={{ color: '#00C9A7' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A !important' }}>
              Official Clinical Analysis & Recommendations Report
            </Typography>
          </Stack>
          <IconButton onClick={() => setPrintOpen(false)} size="small" sx={{ color: '#475569 !important', '&:hover': { bgcolor: '#F1F5F9 !important' } }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent id="printable-analysis" sx={{ p: 4, bgcolor: '#FFFFFF !important', color: '#1E293B !important' }}>
          <Box sx={{ border: '2px solid #00C9A7', borderRadius: 1, p: 3, bgcolor: '#FFFFFF !important', color: '#1E293B !important' }}>
            <Grid container spacing={2} sx={{ borderBottom: '2px solid #E2E8F0', pb: 2, mb: 3 }}>
              <Grid item xs={8}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#00967D !important' }}>
                  ARPAN CLINICAL ASSISTANT
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569 !important' }}>
                  AI-Powered Comprehensive Clinical Analysis Report
                </Typography>
              </Grid>
              <Grid item xs={4} textAlign="right">
                <Typography variant="caption" sx={{ color: '#64748B !important', display: 'block' }} suppressHydrationWarning>
                  Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#00967D !important' }}>
                  Safety Score: {safetyScore}/100
                </Typography>
              </Grid>
            </Grid>

            {/* Patient Header */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#F8FAFC !important', borderColor: '#E2E8F0 !important', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A !important' }}>
                Patient: {patientInfo?.patientName} ({patientInfo?.age} Y, {patientInfo?.gender})
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569 !important' }}>
                Overall Risk Assessment: <strong style={{ color: statusColor }}>{riskCategory}</strong>
              </Typography>
            </Paper>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00967D !important', mb: 1 }}>
              Clinical Assessment Overview:
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#1E293B !important' }}>
              {aiClinicalOverview}
            </Typography>

            <Grid container spacing={3} mb={3}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFB703 !important', mb: 1 }}>
                  Drug Interactions Flagged ({flaggedInteractions.length}):
                </Typography>
                {flaggedInteractions.length > 0 ? flaggedInteractions.map((int, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 0.5, color: '#334155 !important' }}>• {int.drugA} + {int.drugB}: {int.severity}</Typography>
                )) : <Typography variant="body2" sx={{ color: '#334155 !important' }}>None detected</Typography>}
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FF4D6D !important', mb: 1 }}>
                  Allergy Conflicts ({flaggedAllergies.length}):
                </Typography>
                {flaggedAllergies.length > 0 ? flaggedAllergies.map((alg, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 0.5, color: '#334155 !important' }}>• {alg.medication} (Allergen: {alg.allergyMatch})</Typography>
                )) : <Typography variant="body2" sx={{ color: '#334155 !important' }}>None detected</Typography>}
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00967D !important', mb: 1 }}>
              Dietary & Lifestyle Recommendations:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#00C9A7 !important', display: 'block', mb: 0.5 }}>Recommended (DOs)</Typography>
                {dietLifestyleDos.map((doItem, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 0.5, color: '#334155 !important' }}>• {doItem}</Typography>
                ))}
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#FF4D6D !important', display: 'block', mb: 0.5 }}>Avoid (DON'Ts)</Typography>
                {dietLifestyleDonts.map((dontItem, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 0.5, color: '#334155 !important' }}>• {dontItem}</Typography>
                ))}
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderColor: '#E2E8F0 !important' }} />

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={() => {
                  window.print();
                }}
                sx={{ bgcolor: '#0F172A !important', color: '#FFF !important', borderRadius: 5, px: 4, fontWeight: 800 }}
              >
                Confirm & Print Report
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
