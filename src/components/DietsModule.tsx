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
  Paper,
  Divider,
  Alert,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import {
  Restaurant,
  Scale,
  Print,
  CheckCircle,
  Warning,
  Info,
  Schedule,
  FitnessCenter,
  Close,
  Verified,
  LocalHospital,
  Shield
} from '@mui/icons-material';
import { CLINICAL_DIET_PLANS } from '../mockData/clinicalModulesData';
import { DietPlanItem } from '../types/clinical';
import confetti from 'canvas-confetti';

interface DietsModuleProps {
  patientName?: string;
  patientAge?: number | string;
  patientDisease?: string;
}

export default function DietsModule({
  patientName = 'Robert Vance',
  patientAge = 58,
  patientDisease = 'Essential Hypertension, Type 2 Diabetes'
}: DietsModuleProps) {
  const [selectedDietId, setSelectedDietId] = useState<string>('DIET-01');

  // Patient Profile Form State
  const [currPatientName, setCurrPatientName] = useState<string>(patientName);
  const [currPatientAge, setCurrPatientAge] = useState<number | string>(patientAge);
  const [currPatientGender, setCurrPatientGender] = useState<string>('Male');
  const [currPatientDisease, setCurrPatientDisease] = useState<string>(patientDisease);

  // Interactive BMI Calculator state
  const [weightKg, setWeightKg] = useState<number>(82);
  const [heightCm, setHeightCm] = useState<number>(172);

  // Print modal state
  const [printOpen, setPrintOpen] = useState<boolean>(false);

  // Calculate BMI
  const heightMeters = heightCm / 100;
  const bmi = heightMeters > 0 ? (weightKg / (heightMeters * heightMeters)).toFixed(1) : '27.7';
  const bmiVal = parseFloat(bmi);

  let bmiStatus = 'Normal Weight';
  let bmiColor = '#00C9A7';
  if (bmiVal >= 30) {
    bmiStatus = 'Class I Obesity (Calorie Deficit Required)';
    bmiColor = '#FF4D6D';
  } else if (bmiVal >= 25) {
    bmiStatus = 'Overweight (Weight Loss Target)';
    bmiColor = '#FFB703';
  } else if (bmiVal < 18.5) {
    bmiStatus = 'Underweight (High Calorie Dense Target)';
    bmiColor = '#00B4D8';
  }

  const activeDiet: DietPlanItem = CLINICAL_DIET_PLANS.find(d => d.id === selectedDietId) || CLINICAL_DIET_PLANS[0];

  const handlePrint = () => {
    confetti({ particleCount: 40, spread: 50 });
    setPrintOpen(true);
  };

  return (
    <Card
      sx={{
        borderRadius: 1,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
        background: 'linear-gradient(180deg, rgba(16, 24, 44, 0.95) 0%, rgba(10, 15, 29, 0.98) 100%)',
        border: '1px solid rgba(0, 201, 167, 0.3)'
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        {/* Module Header Banner */}
        <Grid container spacing={3} alignItems="center" mb={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
              Clinical Diet Planner & Electrolyte Management
            </Typography>
          </Grid>

          <Grid item xs={12} md={4} textAlign={{ xs: 'left', md: 'right' }}>
            <Tooltip title="Generate printable PDF/Paper Clinical Dietary & Electrolyte Prescription" arrow placement="top">
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Print />}
                onClick={handlePrint}
                sx={{ borderRadius: 2, px: 3, py: 1.2, fontWeight: 800 }}
              >
                Print Clinical Diet Plan
              </Button>
            </Tooltip>
          </Grid>
        </Grid>

        {/* Interactive Patient Information Form */}
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'rgba(0, 201, 167, 0.3)'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#00C9A7', letterSpacing: 0.5 }}>
            📋 PATIENT PROFILE & NUTRITION DIAGNOSIS FORM
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Patient Full Name"
                value={currPatientName}
                onChange={(e) => setCurrPatientName(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                fullWidth
                size="small"
                label="Age (Years)"
                type="number"
                value={currPatientAge}
                onChange={(e) => setCurrPatientAge(e.target.value)}
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
                value={currPatientDisease}
                onChange={(e) => setCurrPatientDisease(e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ mb: 3 }} />

        {/* Top Controls: Preset Select & BMI Calculator */}
        <Grid container spacing={3} mb={3}>
          {/* Preset Selector */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00C9A7', mb: 1.5 }}>
                🥦 Disease-Based Diet Protocol
              </Typography>
              <TextField
                fullWidth
                select
                size="small"
                label="Select Clinical Diet Preset"
                value={selectedDietId}
                onChange={(e) => setSelectedDietId(e.target.value)}
              >
                {CLINICAL_DIET_PLANS.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name} ({plan.diseaseCategory})
                  </MenuItem>
                ))}
              </TextField>
            </Paper>
          </Grid>

          {/* Weight-Based Goal & BMI Calculator */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.02)', borderColor: bmiColor }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: bmiColor, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Scale fontSize="small" /> Weight & BMI Caloric Goal
                </Typography>
                <Chip label={`BMI: ${bmi} kg/m²`} sx={{ bgcolor: bmiColor, color: '#FFF', fontWeight: 800 }} size="small" />
              </Stack>

              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Weight (kg)"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Height (cm)"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                  />
                </Grid>
              </Grid>

              <Typography variant="caption" sx={{ color: bmiColor, fontWeight: 700, mt: 1, display: 'block' }}>
                Status: {bmiStatus} • Target Energy: {activeDiet.calories} kcal/day
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* 5 Core Dimensions Grid */}
        <Grid container spacing={3}>
          {/* Dimension 1: Nutritional Values & Macros */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.02)', height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00C9A7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                📊 1. Nutritional & Macro Values
              </Typography>

              <Stack spacing={1.5}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Typography variant="caption" color="text.secondary">Target Daily Calories</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#00C9A7' }}>{activeDiet.calories} kcal</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Typography variant="caption" color="text.secondary">Carbohydrates Focus</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeDiet.macroBreakdown.carbs}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Typography variant="caption" color="text.secondary">Protein Allocation</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeDiet.macroBreakdown.protein}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Typography variant="caption" color="text.secondary">Healthy Fats & Oils</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeDiet.macroBreakdown.fats}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Typography variant="caption" color="text.secondary">Dietary Fiber</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeDiet.macroBreakdown.fiber}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Dimension 2 & 4: Electrolyte-Based Management */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.02)', height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFB703', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                ⚡ 4. Electrolyte-Based Management
              </Typography>

              <Stack spacing={1.5} mb={2}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 183, 3, 0.08)', borderLeft: '4px solid #FFB703' }}>
                  <Typography variant="caption" color="text.secondary">Sodium (Na) Threshold</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFB703' }}>{activeDiet.electrolyteLimits.sodium}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 180, 216, 0.08)', borderLeft: '4px solid #00B4D8' }}>
                  <Typography variant="caption" color="text.secondary">Potassium (K) Goal</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00B4D8' }}>{activeDiet.electrolyteLimits.potassium}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(108, 92, 231, 0.08)', borderLeft: '4px solid #6C5CE7' }}>
                  <Typography variant="caption" color="text.secondary">Phosphorus (P) Limit</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6C5CE7' }}>{activeDiet.electrolyteLimits.phosphorus}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 201, 167, 0.08)', borderLeft: '4px solid #00C9A7' }}>
                  <Typography variant="caption" color="text.secondary">Calcium (Ca) Intake</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00C9A7' }}>{activeDiet.electrolyteLimits.calcium}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Recommended vs Avoided Foods */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.02)', height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00C9A7', mb: 1.5 }}>
                ✅ Recommended Foods
              </Typography>
              <Stack spacing={0.8} mb={3}>
                {activeDiet.recommendedFoods.map((rf, i) => (
                  <Stack key={i} direction="row" alignItems="center" spacing={1}>
                    <CheckCircle sx={{ color: '#00C9A7', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{rf}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FF4D6D', mb: 1.5 }}>
                🚫 Foods & Ingredients to Avoid
              </Typography>
              <Stack spacing={0.8}>
                {activeDiet.foodsToAvoid.map((fa, i) => (
                  <Stack key={i} direction="row" alignItems="center" spacing={1}>
                    <Warning sx={{ color: '#FF4D6D', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{fa}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Dimension 5: Frequency of Meals & Timeline */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.02)', borderTop: '4px solid #6C5CE7' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#6C5CE7' }}>
                  <Schedule /> 5. Frequency of Meals & Daily Schedule Matrix
                </Typography>
                <Chip label={activeDiet.mealFrequency.frequency} color="secondary" sx={{ fontWeight: 800 }} />
              </Stack>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Timing</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Meal Name</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Portion Size</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Clinical Focus & Ingredients</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeDiet.mealFrequency.schedule.map((item, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 800, color: '#00C9A7' }}>{item.time}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{item.mealName}</TableCell>
                        <TableCell>{item.portion}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{item.focus}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>

      {/* Printable Clinical Diet Guide Dialog */}
      <Dialog open={printOpen} onClose={() => setPrintOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1 } }}>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocalHospital sx={{ color: '#00C9A7' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Official Clinical Dietary & Electrolyte Prescription
            </Typography>
          </Stack>
          <IconButton onClick={() => setPrintOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 4, bgcolor: '#FFFFFF', color: '#1E293B' }}>
          <Box sx={{ border: '2px solid #00C9A7', borderRadius: 3, p: 3 }}>
            <Grid container spacing={2} sx={{ borderBottom: '2px solid #E2E8F0', pb: 2, mb: 3 }}>
              <Grid item xs={8}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#00967D' }}>
                  DOCPULSE CLINICAL NUTRITION CENTER
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569' }}>
                  Personalized Metabolic & Electrolyte Prescription
                </Typography>
              </Grid>
              <Grid item xs={4} textAlign="right">
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }} suppressHydrationWarning>
                  Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#00967D' }}>
                  Plan: {activeDiet.id}
                </Typography>
              </Grid>
            </Grid>

            {/* Patient Header */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#F8FAFC', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Patient: {currPatientName} ({currPatientAge} Y, {currPatientGender}) • Diagnosis: {currPatientDisease} • BMI: {bmi} kg/m² ({bmiStatus})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Assigned Protocol: <strong>{activeDiet.name}</strong> ({activeDiet.calories} kcal/day)
              </Typography>
            </Paper>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00967D', mb: 1 }}>
              Electrolyte Restrictions:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Sodium: {activeDiet.electrolyteLimits.sodium} • Potassium: {activeDiet.electrolyteLimits.potassium} • Phosphorus: {activeDiet.electrolyteLimits.phosphorus}
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00967D', mb: 1 }}>
              Daily Meal Timeline:
            </Typography>
            <Box sx={{ pl: 2, mb: 3 }}>
              {activeDiet.mealFrequency.schedule.map((ms, i) => (
                <Typography key={i} variant="body2" sx={{ mb: 0.8, color: '#334155' }}>
                  <strong>{ms.time} ({ms.mealName}):</strong> {ms.focus}
                </Typography>
              ))}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={8}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Verified sx={{ color: '#00C9A7' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                    Verified by Clinical Nutrition Specialist & Attending Physician
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={4} textAlign="right">
                <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block' }}>
                  DocPulse Clinical Care OS
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setPrintOpen(false)} variant="outlined">
            Close
          </Button>
          <Button onClick={() => window.print()} variant="contained" color="primary" startIcon={<Print />}>
            Print Guide
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
