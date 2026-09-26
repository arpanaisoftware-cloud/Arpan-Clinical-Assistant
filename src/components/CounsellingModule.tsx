'use client';

import React, { useState } from 'react';
import * as Yup from 'yup';
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
  LocalHospital,
  Biotech
} from '@mui/icons-material';
import { COUNSELLING_RISK_DATABASE } from '../mockData/clinicalModulesData';
import { RiskAssessmentItem, RiskCategoryType } from '../types/clinical';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';

// ─── Yup Validation Schema ────────────────────────────────────────────────────
const counsellingSchema = Yup.object({
  currPatientName: Yup.string().trim().required('Patient name is required'),
  currPatientAge: Yup.mixed()
    .test('required', 'Age is required', (v) => v !== '' && v !== null && v !== undefined)
    .test('positive', 'Enter a valid age', (v) => Number(v) > 0 && Number(v) < 130),
  currPatientGender: Yup.string().required('Gender is required'),
  currPatientDisease: Yup.string().trim().required('Diagnosis / condition is required'),
  sbp: Yup.mixed()
    .test('required', 'Systolic BP is required', (v) => v !== '' && v !== null && v !== undefined)
    .test('range', 'Enter a valid BP (60–300 mmHg)', (v) => Number(v) >= 60 && Number(v) <= 300),
  hba1c: Yup.mixed()
    .test('required', 'HbA1c is required', (v) => v !== '' && v !== null && v !== undefined)
    .test('range', 'Enter a valid HbA1c (3–20%)', (v) => Number(v) >= 3 && Number(v) <= 20),
  egfr: Yup.mixed()
    .test('required', 'eGFR is required', (v) => v !== '' && v !== null && v !== undefined)
    .test('range', 'Enter a valid eGFR (1–200)', (v) => Number(v) >= 1 && Number(v) <= 200),
});

type FormErrors = {
  currPatientName?: string;
  currPatientAge?: string;
  currPatientGender?: string;
  currPatientDisease?: string;
  sbp?: string;
  hba1c?: string;
  egfr?: string;
};

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
  // Patient Profile Form State — start empty, show placeholders only
  const [currPatientName, setCurrPatientName] = useState<string>('');
  const [currPatientAge, setCurrPatientAge] = useState<number | string>('');
  const [currPatientGender, setCurrPatientGender] = useState<string>('');
  const [currPatientDisease, setCurrPatientDisease] = useState<string>('');

  // Custom patient parameters state — start empty
  const [sbp, setSbp] = useState<number | string>('');
  const [hba1c, setHba1c] = useState<number | string>('');
  const [egfr, setEgfr] = useState<number | string>('');
  const [sensationLoss, setSensationLoss] = useState<string>('');
  const [footGrade, setFootGrade] = useState<string>('');

  // Print modal state
  const [printOpen, setPrintOpen] = useState<boolean>(false);

  // Controls whether the risk section is visible (only after form submit)
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Field-level validation errors
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleSubmitForm = async () => {
    setFormErrors({});
    try {
      await counsellingSchema.validate(
        { currPatientName, currPatientAge, currPatientGender, currPatientDisease, sbp, hba1c, egfr },
        { abortEarly: false }
      );
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errs: FormErrors = {};
        err.inner.forEach((e) => { if (e.path) errs[e.path as keyof FormErrors] = e.message; });
        setFormErrors(errs);
        toast.error('Please fill in all required fields before generating the report.', {
          toastId: 'counselling-form-validation',
        });
        return;
      }
    }
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setSubmitted(true);
    setTimeout(() => {
      const el = document.getElementById('counselling-risk-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLoadDemo = () => {
    // Fill all fields with a realistic demo patient
    setCurrPatientName('Robert Vance');
    setCurrPatientAge(58);
    setCurrPatientGender('Male');
    setCurrPatientDisease('Essential Hypertension, Type 2 Diabetes, Dyslipidaemia');
    setSbp(152);
    setHba1c(8.4);
    setEgfr(61);
    setSensationLoss('Mild Loss');
    setFootGrade('Grade 1 (Superficial Ulcer)');
    // Auto-submit after filling
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setSubmitted(true);
    setTimeout(() => {
      const el = document.getElementById('counselling-risk-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
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

            <Stack direction="row" alignItems="center" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<Biotech />}
                onClick={handleLoadDemo}
                sx={{ borderStyle: 'dashed', fontWeight: 700, borderRadius: 1 }}
              >
                Load Demo Patient
              </Button>
              {/* <Chip
                icon={<Verified sx={{ fontSize: '14px !important', color: '#FFF !important' }} />}
                label="UNIFIED CLINICAL INTAKE"
                size="small"
                color="secondary"
                sx={{ fontWeight: 800, fontSize: '0.65rem', px: 1, height: 26 }}
              /> */}
            </Stack>
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
                  label="Patient Full Name *"
                  placeholder="e.g. Robert Vance"
                  value={currPatientName}
                  onChange={(e) => setCurrPatientName(e.target.value)}
                  error={!!formErrors.currPatientName}
                  helperText={formErrors.currPatientName}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Age (Years) *"
                  type="number"
                  placeholder="e.g. 58"
                  value={currPatientAge}
                  onChange={(e) => setCurrPatientAge(e.target.value)}
                  error={!!formErrors.currPatientAge}
                  helperText={formErrors.currPatientAge}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Gender *"
                  value={currPatientGender}
                  onChange={(e) => setCurrPatientGender(e.target.value)}
                  SelectProps={{ displayEmpty: true }}
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.currPatientGender}
                  helperText={formErrors.currPatientGender}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                >
                  <MenuItem value=""><em>Select Patient Gender</em></MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Clinical Condition / Diagnosis *"
                  placeholder="e.g. Essential Hypertension, Type 2 Diabetes"
                  value={currPatientDisease}
                  onChange={(e) => setCurrPatientDisease(e.target.value)}
                  error={!!formErrors.currPatientDisease}
                  helperText={formErrors.currPatientDisease}
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
                  label="Systolic BP (mmHg) *"
                  placeholder="e.g. 142"
                  value={sbp}
                  onChange={(e) => setSbp(e.target.value)}
                  error={!!formErrors.sbp}
                  helperText={formErrors.sbp}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={2.4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ step: 0.1 }}
                  label="HbA1c (%) *"
                  placeholder="e.g. 7.8"
                  value={hba1c}
                  onChange={(e) => setHba1c(e.target.value)}
                  error={!!formErrors.hba1c}
                  helperText={formErrors.hba1c}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={2.4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="eGFR (mL/min) *"
                  placeholder="e.g. 68"
                  value={egfr}
                  onChange={(e) => setEgfr(e.target.value)}
                  error={!!formErrors.egfr}
                  helperText={formErrors.egfr}
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
                  SelectProps={{ displayEmpty: true }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                >
                  <MenuItem value=""><em>Select Monofilament Sensation Level</em></MenuItem>
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
                  SelectProps={{ displayEmpty: true }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                >
                  <MenuItem value=""><em>Select Wagner Foot Grade</em></MenuItem>
                  <MenuItem value="Grade 0 (Intact Skin)">Grade 0 (Intact Skin)</MenuItem>
                  <MenuItem value="Grade 1 (Superficial Ulcer)">Grade 1 (Superficial Ulcer)</MenuItem>
                  <MenuItem value="Grade 2 (Deep Ulcer)">Grade 2 (Deep Ulcer)</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* Submit Button */}
          <Box sx={{ mt: 2.5, textAlign: 'right' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<Shield />}
              onClick={handleSubmitForm}
              sx={{ borderRadius: 1, px: 4, py: 1.2, fontWeight: 800, fontSize: '0.95rem' }}
            >
              Generate Counselling Report
            </Button>
          </Box>
        </Paper>

        {/* 5 Risk Category Tabs — shown only after form is submitted */}
        {!submitted && (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 1,
              textAlign: 'center',
              mt: 2,
              bgcolor: isDark ? 'rgba(108, 92, 231, 0.05)' : 'rgba(108, 92, 231, 0.03)',
              borderColor: isDark ? 'rgba(108, 92, 231, 0.2)' : '#E2E8F0',
              borderStyle: 'dashed'
            }}
          >
            <Shield sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
              Counselling Report Not Generated Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill in the patient details and vitals above, then click <strong>Generate Counselling Report</strong> to view all 5 risk category assessments.
            </Typography>
          </Paper>
        )}

        {submitted && (
          <Box id="counselling-risk-section">
            {/* Tabs for Risk Categories */}
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 3,
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: '0.9rem', minHeight: 64 },
                '& .Mui-selected': { color: COUNSELLING_RISK_DATABASE[activeTab]?.color }
              }}
              TabIndicatorProps={{ style: { backgroundColor: COUNSELLING_RISK_DATABASE[activeTab]?.color } }}
            >
              {COUNSELLING_RISK_DATABASE.map((risk, idx) => {
                const Icon = [Favorite, Visibility, WaterDrop, FlashOn, Pets][idx] || Shield;
                return (
                  <Tab
                    key={risk.id}
                    icon={<Icon />}
                    iconPosition="start"
                    label={`${idx + 1}. ${risk.title.split('(')[0].trim()}`}
                    sx={{ color: activeTab === idx ? risk.color : 'text.secondary' }}
                  />
                );
              })}
            </Tabs>

            {/* Selected Risk Category Overview */}
            <Box>
              {[COUNSELLING_RISK_DATABASE[activeTab]].filter(Boolean).map((risk) => (
                <Grid container spacing={3} key={risk.id}>
                  {/* Left Column: Risk Score & Key Indicators */}
                  <Grid item xs={12} md={5}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        borderRadius: 1,
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
                        borderColor: risk.color,
                        height: '100%'
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Chip
                          label={risk.riskLevel}
                          sx={{ bgcolor: risk.color, color: '#FFF', fontWeight: 800, fontSize: '0.85rem' }}
                        />
                        <Typography variant="h4" sx={{ fontWeight: 900, color: risk.color }}>
                          {risk.score}<Typography component="span" variant="h6" color="text.secondary">/100 Risk</Typography>
                        </Typography>
                      </Stack>

                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {risk.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mb={2.5}>
                        {risk.subtitle}
                      </Typography>

                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00C9A7', mb: 1 }}>
                        🔍 Primary Risk Factors Flagged:
                      </Typography>
                      <Stack spacing={1} mb={3}>
                        {risk.keyIndicators.map((ind, i) => (
                          <Stack key={i} direction="row" alignItems="flex-start" spacing={1}>
                            <Warning sx={{ color: risk.color, fontSize: 18, mt: 0.2 }} />
                            <Typography variant="body2" sx={{ fontSize: '0.88rem' }}>{ind}</Typography>
                          </Stack>
                        ))}
                      </Stack>

                      <Alert severity="info" sx={{ borderRadius: 1 }}>
                        <strong>Screening Protocol:</strong> {risk.screeningSchedule}
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
                          {risk.clinicalGuidance.map((cg, i) => (
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
                          {risk.patientAdvice.map((pa, i) => (
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
              ))}
            </Box>

            {/* Reset button */}
            <Box sx={{ textAlign: 'right', mt: 3 }}>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={() => {
                  setSubmitted(false);
                  setCurrPatientName('');
                  setCurrPatientAge('');
                  setCurrPatientGender('');
                  setCurrPatientDisease('');
                  setSbp('');
                  setHba1c('');
                  setEgfr('');
                  setSensationLoss('');
                  setFootGrade('');
                }}
                sx={{ fontWeight: 700, borderRadius: 1 }}
              >
                ↺ Reset &amp; Edit Patient Info
              </Button>
            </Box>
          </Box>
        )}
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

        <DialogContent id="printable-counselling" sx={{ p: 4, bgcolor: '#FFFFFF !important', color: '#1E293B !important' }}>
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
                Comprehensive 5-Point Diabetic & Hypertensive Risk Evaluation
              </Typography>
            </Paper>

            {/* Content List */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4C1D95 !important', mb: 2 }}>
              Key Health Action Steps For Patient:
            </Typography>
            <Box sx={{ pl: 1, mb: 3 }}>
              {COUNSELLING_RISK_DATABASE.map((risk) => (
                <Box key={risk.id} sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: risk.color }}>
                    {risk.title} ({risk.riskLevel})
                  </Typography>
                  {risk.patientAdvice.map((adv, idx) => (
                    <Typography key={idx} variant="body2" sx={{ mb: 0.5, color: '#334155 !important' }}>
                      • {adv}
                    </Typography>
                  ))}
                </Box>
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
