'use client';

import React, { useState } from 'react';
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
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Favorite,
  Visibility,
  WaterDrop,
  FlashOn,
  Pets,
  Print,
  CheckCircle,
  Warning,
  Info,
  MedicalServices,
  Shield,
  Close,
  Verified,
  LocalHospital
} from '@mui/icons-material';
import { COUNSELLING_RISK_DATABASE } from '../mockData/clinicalModulesData';
import { RiskAssessmentItem, RiskCategoryType } from '../types/clinical';
import confetti from 'canvas-confetti';

interface CounsellingModuleProps {
  patientName?: string;
  patientAge?: number | string;
  patientDisease?: string;
}

export default function CounsellingModule({
  patientName = 'Robert Vance',
  patientAge = 58,
  patientDisease = 'Essential Hypertension, Type 2 Diabetes'
}: CounsellingModuleProps) {
  const [selectedCategory, setSelectedCategory] = useState<RiskCategoryType>('cardiovascular');

  // Patient Profile Form State
  const [currPatientName, setCurrPatientName] = useState<string>(patientName);
  const [currPatientAge, setCurrPatientAge] = useState<number | string>(patientAge);
  const [currPatientGender, setCurrPatientGender] = useState<string>('Male');
  const [currPatientDisease, setCurrPatientDisease] = useState<string>(patientDisease);

  // Custom patient parameters state
  const [sbp, setSbp] = useState<number>(142);
  const [hba1c, setHba1c] = useState<number>(7.8);
  const [egfr, setEgfr] = useState<number>(68);
  const [sensationLoss, setSensationLoss] = useState<string>('Normal');
  const [footGrade, setFootGrade] = useState<string>('Grade 0 (Intact Skin)');

  // Print modal state
  const [printOpen, setPrintOpen] = useState<boolean>(false);

  const activeRisk = COUNSELLING_RISK_DATABASE.find(r => r.id === selectedCategory) || COUNSELLING_RISK_DATABASE[0];

  const handleTabChange = (_e: React.SyntheticEvent, newValue: RiskCategoryType) => {
    setSelectedCategory(newValue);
  };

  const handlePrint = () => {
    confetti({ particleCount: 40, spread: 50 });
    setPrintOpen(true);
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        borderRadius: 1,
        boxShadow: isDark ? '0 12px 40px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
        background: isDark
          ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 29, 0.98) 100%)'
          : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        color: 'text.primary',
        border: isDark ? '1px solid rgba(108, 92, 231, 0.3)' : '1px solid #E2E8F0'
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        {/* Module Header Banner */}
        <Grid container spacing={3} alignItems="center" mb={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
              Patient Chronic Risk Counselling & Education Center
            </Typography>
          </Grid>

          <Grid item xs={12} md={4} textAlign={{ xs: 'left', md: 'right' }}>
            <Tooltip title="Generate printable PDF/Paper Patient Education & Care Sheet" arrow placement="top">
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<Print />}
                onClick={handlePrint}
                sx={{ borderRadius: 1, px: 3, py: 1.2, fontWeight: 800 }}
              >
                Print Patient Care Sheet
              </Button>
            </Tooltip>
          </Grid>
        </Grid>

        {/* Unified Patient Profile, Intake & Vitals Calculator Form */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3.5,
            borderRadius: 1,
            background: isDark
              ? 'linear-gradient(135deg, rgba(108, 92, 231, 0.08) 0%, rgba(0, 201, 167, 0.06) 100%)'
              : 'linear-gradient(135deg, rgba(108, 92, 231, 0.04) 0%, rgba(0, 201, 167, 0.03) 100%)',
            border: isDark ? '1px solid rgba(108, 92, 231, 0.35)' : '1px solid #CBD5E1',
            boxShadow: isDark ? '0 12px 32px rgba(108, 92, 231, 0.1)' : '0 4px 16px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Header Badge & Title */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.5,
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #00C9A7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  boxShadow: '0 4px 14px rgba(108, 92, 231, 0.35)'
                }}
              >
                <MedicalServices sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.01em' }}>
                  Patient Intake & Clinical Vitals Risk Calculator
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Integrated Demographics, Diagnosis & Diagnostic Vitals Calculator
                </Typography>
              </Box>
            </Stack>

            <Chip
              icon={<Verified sx={{ fontSize: '14px !important', color: '#FFF !important' }} />}
              label="UNIFIED CLINICAL INTAKE"
              size="small"
              color="secondary"
              sx={{ fontWeight: 800, fontSize: '0.65rem', px: 1, height: 26 }}
            />
          </Stack>

          {/* Section 1: Demographics & Diagnosis */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 1,
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#00C9A7', display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5, letterSpacing: 0.5 }}>
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00C9A7' }} />
              1. PATIENT DEMOGRAPHICS & PRIMARY DIAGNOSIS
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Patient Full Name"
                  placeholder="e.g. Robert Vance"
                  value={currPatientName}
                  onChange={(e) => setCurrPatientName(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Age (Years)"
                  type="number"
                  placeholder="58"
                  value={currPatientAge}
                  onChange={(e) => setCurrPatientAge(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Gender"
                  value={currPatientGender}
                  onChange={(e) => setCurrPatientGender(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Clinical Condition / Diagnosis"
                  placeholder="e.g. Essential Hypertension, Type 2 Diabetes"
                  value={currPatientDisease}
                  onChange={(e) => setCurrPatientDisease(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 2: Clinical Vitals & Risk Score Input Parameters */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C5CE7', display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5, letterSpacing: 0.5 }}>
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6C5CE7' }} />
              2. CLINICAL VITALS & RISK SCORE INPUT PARAMETERS
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4} md={2.4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Systolic BP (mmHg)"
                  value={sbp}
                  onChange={(e) => setSbp(Number(e.target.value))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={2.4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ step: 0.1 }}
                  label="HbA1c (%)"
                  value={hba1c}
                  onChange={(e) => setHba1c(Number(e.target.value))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={2.4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="eGFR (mL/min)"
                  value={egfr}
                  onChange={(e) => setEgfr(Number(e.target.value))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Monofilament Sensation"
                  value={sensationLoss}
                  onChange={(e) => setSensationLoss(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                >
                  <MenuItem value="Normal">Normal (10/10 points)</MenuItem>
                  <MenuItem value="Mild Loss">Mild Loss (7-9 points)</MenuItem>
                  <MenuItem value="Severe Loss">Severe Numbness (&lt;6 points)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Wagner Foot Grade"
                  value={footGrade}
                  onChange={(e) => setFootGrade(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                >
                  <MenuItem value="Grade 0 (Intact Skin)">Grade 0 (Intact Skin)</MenuItem>
                  <MenuItem value="Grade 1 (Superficial Ulcer)">Grade 1 (Superficial Ulcer)</MenuItem>
                  <MenuItem value="Grade 2 (Deep Ulcer)">Grade 2 (Deep Ulcer)</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Paper>

        {/* 5 Risk Category Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, justifyContent: "space-between" }}>
          <Tabs
            value={selectedCategory}
            onChange={handleTabChange}
            textColor="secondary"
            indicatorColor="secondary"
            variant="scrollable"
            scrollButtons="auto"

          >
            <Tab
              value="cardiovascular"
              icon={<Favorite sx={{ color: '#FF4D6D' }} />}
              iconPosition="start"
              label="1. Heart Attack & Stroke"
            />
            <Tab
              value="retinopathy"
              icon={<Visibility sx={{ color: '#FFB703' }} />}
              iconPosition="start"
              label="2. Diabetic Retinopathy"
            />
            <Tab
              value="nephropathy"
              icon={<WaterDrop sx={{ color: '#00B4D8' }} />}
              iconPosition="start"
              label="3. Diabetic Nephropathy"
            />
            <Tab
              value="neuropathy"
              icon={<FlashOn sx={{ color: '#6C5CE7' }} />}
              iconPosition="start"
              label="4. Diabetic Neuropathy"
            />
            <Tab
              value="footRisk"
              icon={<Pets sx={{ color: '#00C9A7' }} />}
              iconPosition="start"
              label="5. Diabetic Foot Risk"
            />
          </Tabs>
        </Box>

        {/* Selected Risk Category Overview */}
        <Grid container spacing={3}>
          {/* Left Column: Risk Score & Key Indicators */}
          <Grid item xs={12} md={5}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 1,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
                borderColor: activeRisk.color,
                height: '100%'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Chip
                  label={activeRisk.riskLevel}
                  sx={{ bgcolor: activeRisk.color, color: '#FFF', fontWeight: 800, fontSize: '0.85rem' }}
                />
                <Typography variant="h4" sx={{ fontWeight: 900, color: activeRisk.color }}>
                  {activeRisk.score}<Typography component="span" variant="h6" color="text.secondary">/100 Risk</Typography>
                </Typography>
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                {activeRisk.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2.5}>
                {activeRisk.subtitle}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00C9A7', mb: 1 }}>
                🔍 Primary Risk Factors Flagged:
              </Typography>
              <Stack spacing={1} mb={3}>
                {activeRisk.keyIndicators.map((ind, i) => (
                  <Stack key={i} direction="row" alignItems="flex-start" spacing={1}>
                    <Warning sx={{ color: activeRisk.color, fontSize: 18, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.88rem' }}>{ind}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Alert severity="info" sx={{ borderRadius: 1 }}>
                <strong>Screening Protocol:</strong> {activeRisk.screeningSchedule}
              </Alert>
            </Paper>
          </Grid>

          {/* Right Column: Physician Guidelines & Patient Advice */}
          <Grid item xs={12} md={7}>
            <Stack spacing={2.5}>
              {/* Clinical Guidelines for Staff & Doctor */}
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, borderLeft: '5px solid #6C5CE7' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#6C5CE7', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🩺 Clinical Decision Support & Target Thresholds
                </Typography>
                <Stack spacing={1.2}>
                  {activeRisk.clinicalGuidance.map((cg, i) => (
                    <Stack key={i} direction="row" alignItems="flex-start" spacing={1}>
                      <CheckCircle sx={{ color: '#6C5CE7', fontSize: 18, mt: 0.3 }} />
                      <Typography variant="body2">{cg}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              {/* Patient Education & Counselling Points */}
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, borderLeft: '5px solid #00C9A7' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00C9A7', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  💡 Patient Counselling & Take-Home Instructions
                </Typography>
                <Stack spacing={1.2}>
                  {activeRisk.patientAdvice.map((pa, i) => (
                    <Stack key={i} direction="row" alignItems="flex-start" spacing={1}>
                      <Info sx={{ color: '#00C9A7', fontSize: 18, mt: 0.3 }} />
                      <Typography variant="body2">{pa}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>

      {/* Printable Patient Counselling Sheet Dialog */}
      <Dialog open={printOpen} onClose={() => setPrintOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1, bgcolor: '#FFFFFF !important', color: '#0F172A !important', backgroundImage: 'none !important', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' } }}>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FFFFFF !important', color: '#0F172A !important', borderBottom: '1px solid #E2E8F0 !important' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocalHospital sx={{ color: '#6C5CE7' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A !important' }}>
              Official Patient Chronic Care & Risk Counselling Sheet
            </Typography>
          </Stack>
          <IconButton onClick={() => setPrintOpen(false)} size="small" sx={{ color: '#475569 !important', '&:hover': { bgcolor: '#F1F5F9 !important' } }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, bgcolor: '#FFFFFF !important', color: '#1E293B !important' }}>
          <Box sx={{ border: '2px solid #6C5CE7', borderRadius: 1, p: 3, bgcolor: '#FFFFFF !important', color: '#1E293B !important' }}>
            {/* Header */}
            <Grid container spacing={2} sx={{ borderBottom: '2px solid #E2E8F0', pb: 2, mb: 3 }}>
              <Grid item xs={8}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#4C1D95 !important' }}>
                  ARPAN CLINICAL COUNSELLING CENTER
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569 !important' }}>
                  Patient Education & Complication Prevention Advisory
                </Typography>
              </Grid>
              <Grid item xs={4} textAlign="right">
                <Typography variant="caption" sx={{ color: '#64748B !important', display: 'block' }} suppressHydrationWarning>
                  Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </Typography>
                {/* <Typography variant="caption" sx={{ fontWeight: 700, color: '#6C5CE7 !important' }}>
                  Ref: #COUNSEL-9941
                </Typography> */}
              </Grid>
            </Grid>

            {/* Patient Header */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#F8FAFC !important', borderColor: '#E2E8F0 !important', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A !important' }}>
                Patient: {currPatientName} ({currPatientAge} Y, {currPatientGender}) • Diagnosis: {currPatientDisease}
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569 !important' }}>
                Evaluated Target Area: <strong style={{ color: '#0F172A' }}>{activeRisk.title}</strong> ({activeRisk.riskLevel})
              </Typography>
            </Paper>

            {/* Content List */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4C1D95 !important', mb: 1 }}>
              Key Health Action Steps For Patient:
            </Typography>
            <Box sx={{ pl: 2, mb: 3 }}>
              {activeRisk.patientAdvice.map((adv, idx) => (
                <Typography key={idx} variant="body2" sx={{ mb: 1, color: '#334155 !important' }}>
                  • {adv}
                </Typography>
              ))}
            </Box>

            <Divider sx={{ mb: 2, borderColor: '#E2E8F0 !important' }} />

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={8}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Verified sx={{ color: '#6C5CE7' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569 !important' }}>
                    Verified by Clinical Care Team & Doctor
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={4} textAlign="right">
                <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', color: '#64748B !important' }}>
                  Arpan Clinical Care OS
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#FFFFFF !important', borderTop: '1px solid #E2E8F0 !important' }}>
          <Button onClick={() => setPrintOpen(false)} variant="outlined" color="inherit" sx={{ color: '#475569 !important', borderColor: '#CBD5E1 !important', '&:hover': { bgcolor: '#F8FAFC !important', borderColor: '#94A3B8 !important' } }}>
            Close
          </Button>
          <Button onClick={() => window.print()} variant="contained" color="secondary" startIcon={<Print />} sx={{ bgcolor: '#6C5CE7 !important', color: '#FFFFFF !important', fontWeight: 800, '&:hover': { bgcolor: '#5B4BC4 !important' } }}>
            Print Document
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
